// 初始化数据ID
export const initJsonData = {
  cells: [
    {
      baseData: {
        name: '开 始',
        englishName: '',
        desc: '',
      },
      data: {
        type: 1,
        isReadOnly: false,
      },
      position: {
        x: 490,
        y: 70,
      },
      size: {
        width: 60,
        height: 60,
      },
      attrs: {
        text: {
          fill: 'green',
          textWrap: {
            text: '开 始',
          },
        },
      },
      shape: 'custom-circle',
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 10,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 10,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 10,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 10,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          {
            group: 'top',
            id: '7fa048c5-73b7-4a7b-9d01-e7f83a0592ef',
          },
          {
            group: 'right',
            id: 'e937b20d-f342-4657-8b43-62c6468cef07',
          },
          {
            group: 'bottom',
            id: '6068260e-d99a-4a32-bc27-fa16b680622d',
          },
          {
            group: 'left',
            id: 'e40248cd-f79d-4304-a73a-fd931bb882f5',
          },
        ],
      },
      id: 'start',
      zIndex: 1,
    },
    {
      baseData: {
        name: '结 束',
        englishName: '',
        desc: '',
      },
      data: {
        type: 2,
        isReadOnly: false,
      },
      position: {
        x: 490,
        y: 658,
      },
      size: {
        width: 60,
        height: 60,
      },
      attrs: {
        text: {
          fill: 'red',
          textWrap: {
            text: '结 束',
          },
        },
      },
      shape: 'custom-circle',
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 10,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 10,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 10,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 10,
                fill: '#fff',
                style: {
                  visibility: 'hidden',
                },
              },
            },
          },
        },
        items: [
          {
            group: 'top',
            id: '76617355-0c11-4817-947a-e7bf7e4cb0ab',
          },
          {
            group: 'right',
            id: '2f220804-8d5a-425d-9882-2007200d2ec4',
          },
          {
            group: 'bottom',
            id: '16134b29-fe2a-4f81-9175-e99f88121cba',
          },
          {
            group: 'left',
            id: '39222936-d741-4dd7-8e01-902dcc330905',
          },
        ],
      },
      id: 'end',
      zIndex: 2,
    },
  ],
};