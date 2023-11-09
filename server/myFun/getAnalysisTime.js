const getTime = (type) => {
    let time = new Date()
    let yestoday = time.getFullYear() + "-" + `${time.getMonth() + 1}`.padStart(2, '0') + "-" + `${time.getDate() - 1}`.padStart(2, '0') + " 00:00:00"
    let today = time.getFullYear() + "-" + `${time.getMonth() + 1}`.padStart(2, '0') + "-" + `${time.getDate()}`.padStart(2, '0') + " 00:00:00"
    let month = time.getFullYear() + "-" + `${time.getMonth() + 1}`.padStart(2, '0') + "-01 00:00:00"
    let lastmonth = time.getFullYear() + "-" + `${time.getMonth() + 1}`.padStart(2, '0') + "-01 00:00:00"
    let year = time.getFullYear() + "-01-01 00:00:00"
    let lastyear = time.getFullYear() + "-01-01 00:00:00"
    let searchLastDate = `1`
    let searchNowDate = `1`
    let advanceLastDate = `1`
    let advanceNowDate = `1`
    if (type === '今天') {
        searchNowDate = `c.create_time >= '${today}'`
        searchLastDate = `c.create_time >= '${yestoday}' and c.create_time < '${today}'`
        advanceNowDate = `c.advance_time >= '${today}'`
        advanceLastDate = `c.advance_time >= '${yestoday}' and c.advance_time < '${today}'`
    } else if (type === '本月') {
        searchNowDate = `c.create_time >= '${month}'`
        searchLastDate = `c.create_time >= '${lastmonth}' and c.create_time < '${month}'`
        advanceNowDate = `c.advance_time >= '${month}'`
        advanceLastDate = `c.advance_time >= '${lastmonth}' and c.advance_time < '${month}'`
    } else if (type === '今年') {
        searchNowDate = `c.create_time >= '${year}'`
        searchLastDate = `c.create_time >= '${lastyear}' and c.create_time < '${year}'`
        advanceNowDate = `c.advance_time >= '${year}'`
        advanceLastDate = `c.advance_time >= '${lastyear}' and c.advance_time < '${year}'`
    } else if (type === '全部') {
        where = ``
    }
    return { searchLastDate, searchNowDate, advanceLastDate, advanceNowDate }
}

module.exports = getTime