export const company = [
    { label: "总公司", value: "总公司" },
    { label: "杭州", value: "杭州" },
    { label: "杭州", value: "杭州" }
]
export const department = [
    { label: "总裁办", value: "总裁办" },
    { label: "事业部", value: "事业部" },
    { label: "直播部", value: "直播部" },
    { label: "财务部", value: "财务部" }
]
export const position = [
    { label: "管理员", value: "管理员" },
    { label: "总裁", value: "总裁" },
    { label: "副总", value: "副总" },
    { label: "主管", value: "主管" },
    { label: "商务", value: "商务" },
    { label: "主播", value: "主播" },
    { label: "财务", value: "财务" },
    { label: "助理", value: "助理" }
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
            }
        ] 
    }
]
