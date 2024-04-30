export const company = [
    { key: 0, label: "总公司", value: "总公司" },
    { key: 1, label: "杭州", value: "杭州" },
    { key: 2, label: "深圳", value: "深圳" }
]

export const department = [
    { key: 0, label: "总裁办", value: "总裁办" },
    { key: 1, label: "事业部", value: "事业部" },
    { key: 2, label: "直播部", value: "直播部" },
    { key: 3, label: "财务部", value: "财务部" }
]

export const position = [
    { key: 0, label: "管理员", value: "管理员" },
    { key: 1, label: "总裁", value: "总裁" },
    { key: 2, label: "副总", value: "副总" },
    { key: 3, label: "主管", value: "主管" },
    { key: 4, label: "商务", value: "商务" },
    { key: 5, label: "主播", value: "主播" },
    { key: 6, label: "财务", value: "财务" },
    { key: 7, label: "助理", value: "助理" },
    { key: 8, label: "中控", value: "中控" }
]

export const combine = [
    { 
        label: "总公司", 
        value: "总公司",
        children: [
            {
                label: "事业部", 
                value: "事业部",
                children: [
                    {
                        label: "副总", 
                        value: "副总"
                    },
                    {
                        label: "助理", 
                        value: "助理"
                    }
                ]
            },
            {
                label: "直播部", 
                value: "直播部",
                children: [
                    {
                        label: "主管", 
                        value: "主管"
                    },
                    {
                        label: "主播", 
                        value: "主播"
                    }
                ]
            },
            {
                label: "财务部", 
                value: "财务部",
                children: [
                    {
                        label: "主管", 
                        value: "主管"
                    },
                    {
                        label: "财务", 
                        value: "财务"
                    }
                ]
            }
        ]
    },
    { 
        label: "杭州", 
        value: "杭州",
        children: [
            {
                label: "事业部", 
                value: "事业部",
                children: [
                    {
                        label: "主管", 
                        value: "主管"
                    },
                    {
                        label: "助理", 
                        value: "助理"
                    },
                    {
                        label: "商务", 
                        value: "商务"
                    }
                ]
            },
            {
                label: "直播部", 
                value: "直播部",
                children: [
                    {
                        label: "中控", 
                        value: "中控"
                    }
                ]
            }
        ]
    },
    { 
        label: "深圳", 
        value: "深圳",
        children: [
            {
                label: "事业部", 
                value: "事业部",
                children: [
                    {
                        label: "主管", 
                        value: "主管"
                    },
                    {
                        label: "助理", 
                        value: "助理"
                    },
                    {
                        label: "商务", 
                        value: "商务"
                    }
                ]
            },
            {
                label: "直播部", 
                value: "直播部",
                children: [
                    {
                        label: "中控", 
                        value: "中控"
                    }
                ]
            }
        ] 
    }
]
