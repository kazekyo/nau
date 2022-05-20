import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Safe and quick',
    description: (
      <>
        Nau simplifies cache operations in the Apollo Client and reduces bugs caused by human inattention. Moreover, you
        can write code safely in TypeScript.
      </>
    ),
  },
  {
    title: 'Working on your behalf',
    description: (
      <>
        Nau will guess what you need from the little bit of code you write and automatically do the additional work
        required on your behalf.
      </>
    ),
  },
  {
    title: 'Many useful directives',
    description: <>Using convenient client directives can help you be highly productive.</>,
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
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
  );
}
