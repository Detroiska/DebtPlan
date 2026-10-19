import { describe, it, expect } from 'vitest'
import { calculatePayoff, buildClosureList } from '../src/utils/payoff.js'
import {
  calculateStrategies,
  buildStrategyOrder,
  pickSelectedStrategy,
  pickOptimalStrategy,
} from '../src/utils/strategies.js'

const debt = (id, props) => ({ id, name: '', type: 'credit', ...props })
const params = (freeAmount, startDate = '2026-01-15') => ({ freeAmount, riskFreeRate: null, startDate })
const paramsRf = (freeAmount, riskFreeRate, startDate = '2026-01-15') => ({ freeAmount, riskFreeRate, startDate })
const emptyParams = { freeAmount: 0, riskFreeRate: null, startDate: '2026-01-01' }

describe('calculatePayoff: один долг', () => {
  it('apr 0: закрывается за 2 месяца, переплата 0', () => {
    const r = calculatePayoff([debt('a', { balance: 2000, apr: 0, minPayment: 500 })], params(1000), ['a'])
    expect(r.isEmpty).toBe(false)
    expect(r.stalled).toBe(false)
    expect(r.months).toBe(2)
    expect(r.payoffDate).toBe('2026-02-01')
    expect(r.totalInterest).toBe(0)
    expect(r.totalPayment).toBe(2000)
    expect(r.closedOrder).toEqual(['a'])
    expect(r.schedule[0].monthIso).toBe('2026-01')
    expect(r.schedule[1].monthIso).toBe('2026-02')
  })

  it('проценты = ставка/12 в месяц, начисляются до платежа', () => {
    const r = calculatePayoff([debt('a', { balance: 12000, apr: 12, minPayment: 500 })], params(1000))
    const m1 = r.schedule[0].rows.find((row) => row.debtId === 'a')
    const m2 = r.schedule[1].rows.find((row) => row.debtId === 'a')
    expect(m1.interest).toBe(120)
    expect(m1.payment).toBe(1000)
    expect(m1.principal).toBe(880)
    expect(m1.endBalance).toBe(11120)
    expect(m2.interest).toBe(111.2)
    expect(m2.endBalance).toBe(10231.2)
  })

  it('последний платёж не превышает баланс', () => {
    const r = calculatePayoff([debt('a', { balance: 700, apr: 0, minPayment: 500 })], params(1000), ['a'])
    expect(r.months).toBe(1)
    expect(r.schedule[0].rows[0].payment).toBe(700)
    expect(r.totalPayment).toBe(700)
  })

  it('структура строки графика: interest, payment, principal, endBalance', () => {
    const r = calculatePayoff([debt('a', { balance: 500, apr: 10, minPayment: 500 })], params(500), ['a'])
    expect(r.months).toBe(2)
    expect(r.schedule[0].rows[0].debtId).toBe('a')
    expect(r.schedule[0].rows[0].interest).toBe(4.17)
    expect(r.schedule[0].rows[0].payment).toBe(500)
    expect(r.schedule[0].rows[0].principal).toBe(495.83)
    expect(r.schedule[0].rows[0].endBalance).toBe(4.17)
    expect(r.schedule[1].rows[0].interest).toBe(0.03)
    expect(r.schedule[1].rows[0].payment).toBe(4.2)
    expect(r.schedule[1].rows[0].endBalance).toBe(0)
    expect(r.totalInterest).toBe(4.2)
  })

  it('параметры не заданы -> свобода 0, stalled', () => {
    const r = calculatePayoff([debt('a', { balance: 1000, apr: 10, minPayment: 500 })], undefined, ['a'])
    expect(r.stalled).toBe(true)
  })
})

describe('calculatePayoff: несколько долгов', () => {
  it('каскад: мин. платёж закрытого долга переходит к следующему', () => {
    const debts = [
      debt('a', { balance: 2000, apr: 0, minPayment: 500 }),
      debt('b', { balance: 3000, apr: 0, minPayment: 500 }),
    ]
    const r = calculatePayoff(debts, params(1500), ['a', 'b'])
    expect(r.months).toBe(4)
    expect(r.closedOrder).toEqual(['a', 'b'])
    expect(r.schedule[0].rows.find((row) => row.debtId === 'a').payment).toBe(1000)
    expect(r.schedule[0].rows.find((row) => row.debtId === 'b').payment).toBe(500)
    expect(r.schedule[2].rows.find((row) => row.debtId === 'b').payment).toBe(1500)
    expect(r.totalPayment).toBe(5000)
  })

  it('порядок влияет на переплату: первым дорогой долг дешевле', () => {
    const debts = [
      debt('a', { balance: 1000, apr: 24, minPayment: 500 }),
      debt('b', { balance: 1000, apr: 12, minPayment: 500 }),
    ]
    const byApr = calculatePayoff(debts, params(1050), ['a', 'b'])
    const reverse = calculatePayoff(debts, params(1050), ['b', 'a'])
    expect(byApr.totalInterest).toBe(44.5)
    expect(reverse.totalInterest).toBe(45)
    expect(byApr.closedOrder).toEqual(['a', 'b'])
    expect(reverse.closedOrder).toEqual(['b', 'a'])
  })

  it('бюджет меньше минимумов: частичные платежи по приоритету', () => {
    const debts = [
      debt('a', { balance: 1000, apr: 0, minPayment: 800 }),
      debt('b', { balance: 1000, apr: 0, minPayment: 800 }),
    ]
    const r = calculatePayoff(debts, params(1200), ['a', 'b'])
    expect(r.stalled).toBe(false)
    expect(r.months).toBe(2)
    expect(r.schedule[0].rows.find((row) => row.debtId === 'a').payment).toBe(800)
    expect(r.schedule[0].rows.find((row) => row.debtId === 'b').payment).toBe(400)
    expect(r.schedule[0].rows.find((row) => row.debtId === 'b').endBalance).toBe(600)
  })

  it('неизвестные id в порядке игнорируются, недостающие добавляются в конец', () => {
    const debts = [
      debt('a', { balance: 2000, apr: 0, minPayment: 500 }),
      debt('b', { balance: 2000, apr: 0, minPayment: 500 }),
      debt('c', { balance: 2000, apr: 0, minPayment: 500 }),
    ]
    const r = calculatePayoff(debts, params(2100), ['c', 'zzz', 'c', 'b'])
    expect(r.order).toEqual(['c', 'b', 'a'])
    expect(r.closedOrder).toEqual(['c', 'b', 'a'])
    expect(r.months).toBe(3)
    expect(r.totalPayment).toBe(6000)
  })

  it('пустой список и мусор -> пустой результат без ошибок', () => {
    for (const input of [[], null, undefined, [null, 'x', {}, 42]]) {
      const r = calculatePayoff(input, emptyParams)
      expect(r.isEmpty).toBe(true)
      expect(r.months).toBe(0)
      expect(r.schedule).toEqual([])
      expect(r.totalInterest).toBe(0)
      expect(r.stalled).toBe(false)
    }
  })
})

describe('недостаточная свободная сумма', () => {
  it('проценты съедают бюджет -> stalled без графика и без зацикливания', () => {
    const debts = [
      debt('a', { balance: 5000, apr: 12, minPayment: 2000 }),
      debt('b', { balance: 5000, apr: 12, minPayment: 2000 }),
    ]
    const r = calculatePayoff(debts, params(0), ['a', 'b'])
    expect(r.stalled).toBe(true)
    expect(r.months).toBeNull()
    expect(r.payoffDate).toBeNull()
    expect(r.schedule).toEqual([])
    expect(Number.isFinite(r.totalInterest)).toBe(true)
  })
})

describe('даты погашения', () => {
  it('переход через год: 2026-11 + 5 месяцев = 2027-03', () => {
    const r = calculatePayoff([debt('a', { balance: 5000, apr: 0, minPayment: 1000 })], params(1000, '2026-11-15'), ['a'])
    expect(r.months).toBe(5)
    expect(r.schedule[0].monthIso).toBe('2026-11')
    expect(r.schedule[2].monthIso).toBe('2027-01')
    expect(r.payoffDate).toBe('2027-03-01')
    expect(r.startMonthIso).toBe('2026-11')
  })

  it('дата старта не задана -> текущий месяц, payoffDate имеет формат YYYY-MM-01', () => {
    const r = calculatePayoff([debt('a', { balance: 1000, apr: 0, minPayment: 1000 })], { freeAmount: 1000, startDate: null }, ['a'])
    expect(r.payoffDate).toMatch(/^\d{4}-\d{2}-01$/)
  })
})

describe('buildClosureList', () => {
  it('порядок закрытия и имя долга, unknown-id отсекается', () => {
    const debts = [
      debt('a', { name: 'Долг А', balance: 2000, apr: 0, minPayment: 500 }),
      debt('b', { name: 'Долг Б', balance: 3000, apr: 0, minPayment: 500 }),
    ]
    const r = calculatePayoff(debts, params(1500), ['a', 'b'])
    const closure = buildClosureList(debts, r)
    expect(closure.map((item) => item.id)).toEqual(['a', 'b'])
    expect(closure[0].name).toBe('Долг А')
    expect(closure[0].closedAtIso).toBe('2026-02')

    const fake = { isEmpty: false, closedOrder: ['ghost', 'b'], schedule: r.schedule }
    expect(buildClosureList(debts, fake).map((item) => item.id)).toEqual(['b'])
  })
})

describe('стратегии (FE-013/FE-020)', () => {
  const avalancheDebts = [
    debt('a', { balance: 300, apr: 12, minPayment: 100 }),
    debt('b', { balance: 500, apr: 24, minPayment: 100 }),
    debt('c', { balance: 400, apr: 6, minPayment: 100 }),
  ]

  it('avalanche: сначала дорогие долги, snowball: сначала маленькие', () => {
    expect(buildStrategyOrder('avalanche', avalancheDebts)).toEqual(['b', 'a', 'c'])
    expect(buildStrategyOrder('snowball', avalancheDebts)).toEqual(['a', 'c', 'b'])
  })

  it('оптимальная ровно одна и это минимум переплаты', () => {
    const debts = [
      debt('a', { balance: 1000, apr: 24, minPayment: 500 }),
      debt('b', { balance: 1000, apr: 12, minPayment: 500 }),
    ]
    const list = calculateStrategies(debts, params(1050))
    expect(list.length).toBe(2)
    const optimal = list.filter((s) => s.isOptimal)
    expect(optimal.length).toBe(1)
    expect(optimal[0].totalInterest).toBe(44.5)
    const avalanche = list.find((s) => s.type === 'avalanche')
    const snowball = list.find((s) => s.type === 'snowball')
    expect(avalanche.totalInterest).toBeLessThanOrEqual(snowball.totalInterest)
  })

  it('безрисковая ставка: дешёвый долг гасится только минимумами', () => {
    const debts = [debt('a', { balance: 12000, apr: 8, minPayment: 500 })]
    const avalancheRf = calculateStrategies(debts, paramsRf(1000, 12)).find((s) => s.type === 'avalanche')
    expect(avalancheRf.schedule[0].rows[0].payment).toBe(500)
    expect(avalancheRf.schedule[0].rows[0].endBalance).toBe(11580)
    const avalancheNoRf = calculateStrategies(debts, params(1000)).find((s) => s.type === 'avalanche')
    expect(avalancheNoRf.schedule[0].rows[0].payment).toBe(1000)
    expect(avalancheNoRf.schedule[0].rows[0].endBalance).toBe(11080)
  })

  it('все stalled -> оптимального нет', () => {
    const debts = [
      debt('a', { balance: 5000, apr: 24, minPayment: 2000 }),
      debt('b', { balance: 5000, apr: 12, minPayment: 2000 }),
    ]
    const list = calculateStrategies(debts, params(0))
    expect(list.length).toBe(2)
    expect(list.every((s) => s.stalled && !s.isOptimal)).toBe(true)
  })

  it('своя стратегия входит в сравнение и сбрасывается в оптимальную', () => {
    const debts = [
      debt('a', { balance: 1000, apr: 24, minPayment: 500 }),
      debt('b', { balance: 1000, apr: 12, minPayment: 500 }),
    ]
    const withCustom = calculateStrategies(debts, params(1050), ['b', 'a'])
    expect(withCustom.length).toBe(3)
    expect(withCustom[2].type).toBe('custom')
    expect(withCustom[2].isOptimal).toBe(false)
    expect(pickSelectedStrategy(withCustom, 'custom').type).toBe('custom')

    const afterReset = calculateStrategies(debts, params(1050), null)
    expect(pickSelectedStrategy(afterReset, 'custom').type).toBe('avalanche')
    expect(pickSelectedStrategy(afterReset, 'custom').isOptimal).toBe(true)
  })

  it('pickOptimalStrategy: ничья по переплате -> короче срок; stalled не выбирается', () => {
    const tieA = { isEmpty: false, stalled: false, months: 6, totalInterest: 100 }
    const tieB = { isEmpty: false, stalled: false, months: 4, totalInterest: 100 }
    expect(pickOptimalStrategy([tieA, tieB])).toBe(tieB)
    const stalled = { isEmpty: false, stalled: true, months: null, totalInterest: 5 }
    const normal = { isEmpty: false, stalled: false, months: 5, totalInterest: 999 }
    expect(pickOptimalStrategy([stalled, normal])).toBe(normal)
  })
})