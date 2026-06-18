// JSONPlaceholder API — free fake API for testing and prototyping
// https://jsonplaceholder.typicode.com

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export async function fetchUsers() {
  const response = await fetch(`${BASE_URL}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function fetchUser(id) {
  const response = await fetch(`${BASE_URL}/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

export async function fetchPosts() {
  const response = await fetch(`${BASE_URL}/posts`);
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
}

export async function fetchComments(postId) {
  const response = await fetch(`${BASE_URL}/posts/${postId}/comments`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
}

export async function fetchTodos() {
  const response = await fetch(`${BASE_URL}/todos?_limit=10`);
  if (!response.ok) throw new Error('Failed to fetch todos');
  return response.json();
}

export async function fetchAlbums() {
  const response = await fetch(`${BASE_URL}/albums?_limit=5`);
  if (!response.ok) throw new Error('Failed to fetch albums');
  return response.json();
}

export async function fetchPhotos(albumId) {
  const response = await fetch(`${BASE_URL}/albums/${albumId}/photos`);
  if (!response.ok) throw new Error('Failed to fetch photos');
  return response.json();
}

// Map JSONPlaceholder users to contact format
export function mapUserToContact(user) {
  return {
    id: `jp-${user.id}`,
    name: user.name,
    role: user.company?.catchPhrase?.split(' ').slice(0, 2).join(' ') || 'Professional',
    company: user.company?.name || 'Unknown',
    email: user.email,
    phone: user.phone,
    linkedin: user.website ? `https://${user.website}` : '',
    notes: `Works at ${user.company?.name}. ${user.company?.bs || ''}`,
    tags: [user.company?.name?.split(' ')[0] || 'Contact', 'JSONPlaceholder'],
    is_favorite: false,
    interaction_history: [],
    last_contact: 'Recently added',
    isExternal: true
  };
}

// Map JSONPlaceholder posts to activity format
export function mapPostToActivity(post) {
  const types = ['applied', 'reply', 'interview', 'viewed', 'offer'];
  const type = types[post.id % types.length];
  return {
    id: `jp-${post.id}`,
    action: post.title.replace(/^(.{40}[^\s]*).*/, '$1'),
    details: post.body.slice(0, 80),
    time: type === 'offer' ? '2 days ago' : type === 'interview' ? 'Yesterday' : '5 hours ago',
    type
  };
}
