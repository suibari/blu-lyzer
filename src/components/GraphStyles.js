export default [
  {
    // コンパウンドノードの子ノード, 子ノードを持たない親ノード
    selector: 'node[parent], node[^parent][name]',
    style: {
      'width': 'data(rank)',
      'height': 'data(rank)',
      'font-size': '18',
      'font-weight': 'bold',
      'content': `data(name)`,
      'text-valign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': '140',
      'background-color': 'gold',
      'border-color': 'orange',
      'border-width': '3',
      'color': 'darkred'
    }
  },
  {
    // コンパウンドノード（親ノード）
    selector: 'node[^parent][groupWord][backgroundColor][color]', // 親ノードのみを対象にする
    style: {
      'color': 'data(color)',
      'background-color': 'data(backgroundColor)',
    }
  },
  {
    // コンパウンドノード（親ノード）: デフォルトスタイル
    selector: 'node[^parent][groupWord]', // 親ノードのみを対象にする
    style: {
      'label': 'data(groupWord)',
      'text-valign': 'top',
      'text-halign': 'center',
      'font-size': '40px',
      'font-weight': 'bold',
      'background-opacity': 0.5,
      'border-width': 2,
      'border-color': '#333',
    }
  },
  {
    selector: 'node:selected',
    style: {
      'background-color': 'darkred',
      // 'content': `data(name)`,
      color: 'white',
      'border-color': 'darkred',
      'line-color': '#0e76ba',
      'target-arrow-color': '#0e76ba'
    }
  },
  {
    selector: 'node.todirect',
    style: {
      'background-color': 'blue',
    }
  },
  {
    selector: 'node.fromdirect',
    style: {
      'background-color': 'green',
    }
  },
  {
    selector: 'node.bidirect',
    style: {
      'background-color': 'lightblue',
    }
  },
  {
    selector: 'edge',
    style: {
      'curve-style': 'straight',
      'color': 'darkred',
      'text-background-color': '#ffffff',
      'text-background-opacity': '1',
      'text-background-padding': '3',
      'width': '1',
      'target-arrow-shape': 'triangle',
      'line-color': 'darkred',
      'target-arrow-color': 'darkred',
      'font-weight': 'bold'
    }
  },
  // {
  //   selector: 'edge[label]',
  //   style: {
  //     'content': `data(label)`,
  //   }
  // },
  // {
  //   selector: 'edge.label',
  //   style: {
  //     'line-color': 'orange',
  //     'target-arrow-color': 'orange'
  //   }
  // }
]
