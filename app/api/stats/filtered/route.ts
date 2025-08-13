import { NextRequest, NextResponse } from 'next/server'
import { supabasePublic } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const groupIds = searchParams.get('groupIds')?.split(',').filter(Boolean)

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'dateFrom and dateTo are required' },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 API: Buscando estatísticas filtradas...', { dateFrom, dateTo, groupIds })
    }

    // Buscar todos os dados usando paginação para contornar o limite de 1000 linhas
    let allData: any[] = []
    let from = 0
    const pageSize = 1000
    let hasMore = true

    while (hasMore) {
      let query = supabasePublic
        .from('clicks')
        .select('group_id, created_at, groups(id, name, slug)')
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo)
        .range(from, from + pageSize - 1)
        .order('created_at', { ascending: true })

      if (groupIds?.length) {
        query = query.in('group_id', groupIds)
      }

      const { data, error } = await query
      if (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('❌ API: Erro na consulta Supabase:', error)
        }
        throw error
      }

      if (!data || !Array.isArray(data)) {
        throw new Error('Resultado inválido da consulta')
      }

      allData = allData.concat(data)
      hasMore = data.length === pageSize
      from += pageSize

      if (process.env.NODE_ENV !== 'production') {
        console.log(`📄 API: Página ${Math.ceil(from / pageSize)}: ${data.length} registros (total: ${allData.length})`)
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📊 API: ${allData.length} registros encontrados para o período ${dateFrom} - ${dateTo}`)
    }

    // Agrupar por dia
    const stats = new Map<string, number>()
    const startDate = new Date(dateFrom)
    const endDate = new Date(dateTo)
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      stats.set(d.toISOString().split('T')[0], 0)
    }
    allData.forEach((click: any) => {
      const date = new Date(click.created_at).toISOString().split('T')[0]
      stats.set(date, (stats.get(date) || 0) + 1)
    })

    // Agrupar por grupo
    const groupMap = new Map<string, { group_id: string, group_name: string, group_slug: string, clicks: number }>()
    allData.forEach((click: any) => {
      const group_id = click.group_id
      const group_name = click.groups?.name || '(Sem nome)'
      const group_slug = click.groups?.slug || ''
      if (!groupMap.has(group_id)) {
        groupMap.set(group_id, { group_id, group_name, group_slug, clicks: 0 })
      }
      groupMap.get(group_id)!.clicks++
    })
    const groupClicks = Array.from(groupMap.values()).sort((a, b) => b.clicks - a.clicks)

    const response = {
      dailyClicks: Array.from(stats.entries()).map(([date, clicks]) => ({ date, clicks })),
      groupClicks,
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ API: Estatísticas processadas:', response)
    }
    return NextResponse.json(response)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ API: Erro em getFilteredStats:', error)
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}