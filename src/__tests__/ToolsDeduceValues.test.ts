import { NicordTools } from '../utils/NicordTools'

describe('Tools.deduceValues', () => {
  it('Should deduce (whitelist)', () => {
    const values = [0, 1, 2, 3, 4, 5]
    const whitelist = [1, 2]
    expect(NicordTools.deduceValues(values, null, whitelist)).toEqual([1, 2])
  })

  it('Should deduce (blacklist)', () => {
    const values = [0, 1, 2, 3, 4, 5]
    const blacklist = [1, 2, 3]
    expect(NicordTools.deduceValues(values, blacklist)).toEqual([0, 4, 5])
  })

  it('Should deduce (both)', () => {
    const values = [0, 1, 2, 3, 4, 5]
    const whitelist = [1, 2, 3]
    const blacklist = [2]
    expect(NicordTools.deduceValues(values, blacklist, whitelist)).toEqual([1, 3])
  })

})
