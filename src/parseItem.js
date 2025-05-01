export default function parseItem(item) {
  return {
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    href: item.querySelector('link').textContent,
  }
}
