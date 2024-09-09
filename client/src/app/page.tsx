import type { NextPage } from 'next';
import Head from 'next/head';
import Chat from './components/Chat';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Chat Application</title>
        <meta name="description" content="A simple chat application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Chat />
      </main>
    </div>
  );
};

export default Home;
