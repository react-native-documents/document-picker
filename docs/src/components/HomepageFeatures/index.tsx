import clsx from 'clsx'
import Heading from '@theme/Heading'
import styles from './styles.module.css'
import React from 'react'

type FeatureItem = {
  title: string
  Svg: React.ComponentType<React.ComponentProps<'svg'>>
  description: JSX.Element
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Open-source and free',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>Support the project by contributing PRs on GitHub, or sponsor the author to say thanks!</>
    ),
  },
  {
    title: 'Full-featured',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Supports basic as well as advanced features of the underlying native APIs. Importing,
        opening, virtual files support... Open as issue if something is missing!
      </>
    ),
  },
  {
    title: 'Built and tested for reliability',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        The implementation was tested for correctness on a range of real devices -{' '}
        <a href="docs/sponsor-only/intro#how-do-i-know-it-works">see a test recording</a>.
      </>
    ),
  },
]

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">{/*<Svg className={styles.featureSvg} role="img" />*/}</div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
