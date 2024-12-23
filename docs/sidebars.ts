import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure

  guidesSidebar: [
    {
      type: 'doc',
      label: 'Installation',
      id: 'install',
    },
    {
      type: 'category',
      label: 'Public module',
      collapsible: false,
      items: [{ type: 'autogenerated', dirName: 'public' }],
    },
    {
      type: 'category',
      label: 'Premium modules',
      collapsible: false,
      items: [{ type: 'autogenerated', dirName: 'sponsor-only' }],
    },
  ],
  docPickerApiSidebar: ['doc-picker-api/index'],
  docViewerApiSidebar: ['doc-viewer-api/index'],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
}

export default sidebars
