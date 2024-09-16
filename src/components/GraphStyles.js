export default [
  {
    // コンパウンドノードの子ノード
    selector: 'node[parent][!groupWord]',
    style: {
      'width': '50',
      'height': '50',
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
    selector: 'node[!parent][groupWord]', // 親ノードのみを対象にする
    style: {
      'label': 'data(groupWord)', // コンパウンドノードは `groupWord` フィールドをラベルに使用
      'text-valign': 'top',
      'text-halign': 'center',
      'color': '#000',
      'font-size': '16px',
      'background-color': '#f4a460',
      'border-width': 2,
      'border-color': '#333',
    }
  },
  {
    // グループに所属しないノード
    selector: 'node[!parent][!groupWord]', // 親ノードでなく、`name` を持つノード
    style: {
      'width': '50',
      'height': '50',
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
    selector: 'node:selected',
    style: {
      'background-color': 'darkred',
      'content': `data(name)`,
      color: 'white',
      'border-color': 'darkred',
      'line-color': '#0e76ba',
      'target-arrow-color': '#0e76ba'
    }
  },
  // {
  //   selector: 'edge',
  //   style: {
  //     'curve-style': 'bezier',
  //     'color': 'darkred',
  //     'text-background-color': '#ffffff',
  //     'text-background-opacity': '1',
  //     'text-background-padding': '3',
  //     'width': '3',
  //     'target-arrow-shape': 'triangle',
  //     'line-color': 'darkred',
  //     'target-arrow-color': 'darkred',
  //     'font-weight': 'bold'
  //   }
  // },
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
