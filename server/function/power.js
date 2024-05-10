const power = (items, userInfo) => {
    let where = ''
    for (let i = 0; i < items.length; i++) {
        if (i === 0) {
            where += ` (${items[i]}.status != '失效' OR ${items[i]}.status IS NULL)`
        } else {
            where += ` and (${items[i]}.status != '失效' OR ${items[i]}.status IS NULL)`
        }
    }
    for (let i = 0; i < items.length; i++) {
        if (userInfo.position === '管理员') {
            return where
        } else if (userInfo.position === '总裁') {
            where += ` and (${items[i]}.position != '管理员' OR ${items[i]}.position IS NULL)`
            return where
        }
    }
    where += ` and (`
    for (let i = 0; i < items.length; i++) {
        if (userInfo.position === '管理员') {
            continue
        } else if (userInfo.position === '总裁') {
            continue
        } else if (userInfo.position === '副总' || (userInfo.company === '总公司' && userInfo.position === '助理')) {
            where += ` ${i === 0 ? '' : ' or'} (${items[i]}.department = '${userInfo.department}')`
        } else if (userInfo.position === '主管') {
            where += ` ${i === 0 ? '' : ' or'} (${items[i]}.company = '${userInfo.company}' and ${items[i]}.department = '${userInfo.department}')`
        } else if (['商务', '主播', '中控'].indexOf(userInfo.position) > -1) {
            where += ` ${i === 0 ? '' : ' or'} (${items[i]}.uid = '${userInfo.uid}')`
        } else if (['助理'].indexOf(userInfo.position) > -1) {
            where += ` ${i === 0 ? '' : ' or'} (${items[i]}.uid = '${userInfo.up_uid}')`
        }
    }
    where += `)`
    return where.replace('and ()', ' ')
}

const filter = (type, filters) => {
    let where = ` z.status != '已失效'`
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

const isNull = (info, type) => {
    if (type === 'join') {
        return info ? `'${info.join()}'` : null
    } else {
        return info ? `'${info}'` : null
    }
}

module.exports = { power, filter, isNull }