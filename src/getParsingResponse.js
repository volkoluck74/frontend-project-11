export default function getParsingResponse(response) {
  const parser = new DOMParser()
  const responseXML = parser.parseFromString(response.data.contents, 'text/xml')
  const posts = responseXML.querySelectorAll('channel item')
  // console.log(posts)
  const result = []
  posts.forEach((post) => {
    const item = {
      title: post.querySelector('title').textContent,
      description: post.querySelector('description').textContent,
      href: post.querySelector('link').textContent,
    }
    result.push(item)
  })
  return result
}
