import React from 'react';
import Layout from '../../components/Layout';
import Admin from './Admin';

const title = 'Admin Page';

function action({ store }) {
  const { user } = store.getState();
  if (!user) {
    return { redirect: '/login' };
  }

  return {
    chunks: ['admin'],
    title,
    component: (
      <Layout>
        <Admin title={title} />
      </Layout>
    ),
  };
}

export default action;
