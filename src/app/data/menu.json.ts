const MENUS = [
  {
        path: 'dashboard',
        key: 'general.menu.dashboard',
        title: 'Dashboard',
        icon: 'ion-android-home',
        selected: false,
        expanded: false,
        order: 0,
        children: []
      },
      // conetent manager
      {
        path: 'content',
        key: 'content',
        title: 'Content Manager',
        icon: 'ion-edit',
        selected: false,
        expanded: false,
        order: 1,
        children: [
          {
            path: 'content-test',
            key: 'content.test',
            title: 'Content 1',
            icon: 'ion-edit',
            selected: false,
            expanded: false,
            order: 1,
          }
        ]
      },
      // pages
      {
        path: 'pages',
        key: 'pages',
        title: 'Page Manager',
        icon: 'ion-gear-a',
        selected: true,
        expanded: false,
        order: 2,
        children: [
          {
            path: 'treeview',
            key: 'page.treeview',
            title: 'Page 1',
            icon: 'ion-gear-a',
            selected: false,
            expanded: false,
            order: 0,
          }
        ]
      }
];
export {
    MENUS
}