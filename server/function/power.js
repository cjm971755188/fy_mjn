const power = (items, userInfo) => {
    let where = 'where'
    for (let i = 0; i < items.length; i++) {
        if (i === 0) {
            where += ` (${items[i]}.status != '失效' OR ${items[i]}.status IS NULL)`
        } else {
            where += ` and (${items[i]}.status != '失效' OR ${items[i]}.status IS NULL)`
        }
    }
    if (userInfo.position !== '管理员') {
        where += `and (`
        for (let i = 0; i < items.length; i++) {
            if (i !== 0) {
                where += ` or`
            }
            if (userInfo.position === '总裁') {
                where += ` (${items[i]}.position != '管理员')`
            } else if (userInfo.position === '副总' || (userInfo.company === '总公司' && userInfo.position === '助理')) {
                where += ` (${items[i]}.department = '${userInfo.department}')`
            } else if (userInfo.position === '主管') {
                where += ` (${items[i]}.company = '${userInfo.company}' and ${items[i]}.department = '${userInfo.department}')`
            } else if (['商务', '主播', '中控'].indexOf(userInfo.position) > -1) {
                where += ` (${items[i]}.uid = '${userInfo.uid}')`
            } else if (['助理'].indexOf(userInfo.position) > -1) {
                where += ` (${items[i]}.uid = '${userInfo.up_uid}')`
            }
        }
        where += `)`
        where.replace('and ()', ' ')
    }
    return where
}

const filter = (type, filters) => {
    let where = `where z.status != '已失效'`
    for (let i = 0; i < Object.getOwnPropertyNames(filters).length; i++) {
        if (Object.keys(filters)[i].split('_')[1] == 'id') {
            where += ` and z.${Object.keys(filters)[i]} = '${Object.values(filters)[i]}'`
        } else {
            if (type === 'talent' && Object.keys(filters)[i] === 'name') {
                where += ` and (z.${Object.keys(filters)[i]} like '%${Object.values(filters)[i]}%' or z.account_name like '%${Object.values(filters)[i]}%')`
            } else if (type === 'chance' && Object.keys(filters)[i] == 'account_names') {
                where += ` and (z.account_names like '%${Object.values(filters)[i]}%' or z.group_name like '%${Object.values(filters)[i]}%' or z.provide_name like '%${Object.values(filters)[i]}%' or z.custom_name like '%${Object.values(filters)[i]}%')`
            } else {
                where += ` and z.${Object.keys(filters)[i]} like '%${Object.values(filters)[i]}%'`
            }
        }
    }
    return where
}

module.exports = { power, filter }