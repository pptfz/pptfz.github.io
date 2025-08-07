# docusaurus更新

查看安装的版本

```javascript
npx docusaurus --version
3.6.2
```



查看可安装的版本

```js
$ npm show @docusaurus/core version
3.7.0
```



更新

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="npm" label="npm" default>

```js
npm install @docusaurus/core@latest @docusaurus/preset-classic@latest
```

  </TabItem>
  <TabItem value="yarn" label="yarn">

```js
yarn add @docusaurus/core@latest @docusaurus/preset-classic@latest
```

  </TabItem>
</Tabs>



更新完成后查看版本

```js
$ npx docusaurus --version
3.7.0
```

