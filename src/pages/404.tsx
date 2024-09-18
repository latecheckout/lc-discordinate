export default function Custom404() {
  return null // This won't be rendered
}

export async function getStaticProps() {
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  }
}
