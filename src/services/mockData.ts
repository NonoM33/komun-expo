import { Post, Channel, Message, Resident, User, Comment, Author } from '../types';

export const MOCK_USER: User = {
  id: '1',
  email: 'renaud@komun.app',
  first_name: 'Renaud',
  last_name: 'Cosson',
  avatar_url: 'https://i.pravatar.cc/300?img=12',
  apartment_number: '4B',
  floor: 4,
  phone: '06 12 34 56 78',
  bio: 'Développeur passionné, amateur de café',
  organization_id: '1',
  building_id: '1',
  role: 'resident',
  created_at: '2025-06-15T10:00:00Z',
};

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Travaux ascenseur - Semaine prochaine',
    content: "Bonjour à tous ! L'ascenseur sera en maintenance du lundi au mercredi. Merci de prévoir les escaliers",
    author: { id: '2', first_name: 'Sophie', last_name: 'Martin', avatar_url: 'https://i.pravatar.cc/150?img=5', apartment_number: '2A' },
    image_url: null,
    likes_count: 12,
    comments_count: 5,
    liked: true,
    category: 'info',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: '2',
    title: 'Qui veut des tomates du jardin ?',
    content: "J'ai beaucoup trop de tomates cette année ! Si quelqu'un en veut, passez au 3ème étage. Gratuites bien sûr !",
    author: { id: '3', first_name: 'Pierre', last_name: 'Dubois', avatar_url: 'https://i.pravatar.cc/150?img=8', apartment_number: '3C' },
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
    likes_count: 24,
    comments_count: 8,
    liked: false,
    category: 'entraide',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: '3',
    title: 'Soirée résidents vendredi soir',
    content: "On organise une petite soirée dans le local commun vendredi à 19h. Chacun ramène un plat ou une boisson. Ambiance conviviale garantie !",
    author: { id: '4', first_name: 'Amira', last_name: 'Benali', avatar_url: 'https://i.pravatar.cc/150?img=9', apartment_number: '5A' },
    image_url: null,
    likes_count: 31,
    comments_count: 14,
    liked: true,
    category: 'event',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: '4',
    title: 'Colis suspect dans le hall',
    content: "Il y a un colis non identifié devant les boîtes aux lettres depuis 2 jours. Quelqu'un le reconnaît ?",
    author: { id: '5', first_name: 'Marc', last_name: 'Lefèvre', avatar_url: 'https://i.pravatar.cc/150?img=11', apartment_number: '1B' },
    image_url: null,
    likes_count: 3,
    comments_count: 2,
    liked: false,
    category: 'question',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: '5',
    title: 'Nouveau local vélo ouvert !',
    content: "Le local vélo au sous-sol est enfin accessible. Le code est 4589. Merci de bien refermer derrière vous.",
    author: { id: '2', first_name: 'Sophie', last_name: 'Martin', avatar_url: 'https://i.pravatar.cc/150?img=5', apartment_number: '2A' },
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
    likes_count: 19,
    comments_count: 6,
    liked: false,
    category: 'info',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const MOCK_CHANNELS: Channel[] = [
  { id: '1', name: 'Général', description: 'Discussions générales de l\'immeuble', last_message: 'Sophie: Bonne soirée à tous !', last_message_at: new Date(Date.now() - 600000).toISOString(), unread_count: 3, members_count: 42, icon: '🏠' },
  { id: '2', name: 'Entraide', description: 'Coups de main entre voisins', last_message: 'Pierre: Quelqu\'un a une perceuse ?', last_message_at: new Date(Date.now() - 1800000).toISOString(), unread_count: 1, members_count: 38, icon: '🤝' },
  { id: '3', name: 'Bruit & Nuisances', description: 'Signalement des nuisances sonores', last_message: 'Marc: C\'est calme ce soir', last_message_at: new Date(Date.now() - 7200000).toISOString(), unread_count: 0, members_count: 35, icon: '🔇' },
  { id: '4', name: 'Colis & Livraisons', description: 'Infos colis et livraisons', last_message: 'Amira: Colis reçu, merci !', last_message_at: new Date(Date.now() - 10800000).toISOString(), unread_count: 0, members_count: 40, icon: '📦' },
  { id: '5', name: 'Jardinage', description: 'Le jardin partagé', last_message: 'Julie: Les fraises sont prêtes', last_message_at: new Date(Date.now() - 86400000).toISOString(), unread_count: 5, members_count: 18, icon: '🌱' },
];

export const MOCK_MESSAGES: Message[] = [
  { id: '1', content: 'Salut tout le monde ! Quelqu\'un sait quand le gardien revient ?', author: { id: '3', first_name: 'Pierre', last_name: 'Dubois', avatar_url: 'https://i.pravatar.cc/150?img=8' }, created_at: new Date(Date.now() - 3600000).toISOString(), channel_id: '1' },
  { id: '2', content: 'Il revient lundi normalement', author: { id: '2', first_name: 'Sophie', last_name: 'Martin', avatar_url: 'https://i.pravatar.cc/150?img=5' }, created_at: new Date(Date.now() - 3000000).toISOString(), channel_id: '1' },
  { id: '3', content: 'Super merci Sophie !', author: { id: '3', first_name: 'Pierre', last_name: 'Dubois', avatar_url: 'https://i.pravatar.cc/150?img=8' }, created_at: new Date(Date.now() - 2400000).toISOString(), channel_id: '1' },
  { id: '4', content: 'Au fait, la porte du garage ferme mal en ce moment. Quelqu\'un d\'autre a remarqué ?', author: { id: '4', first_name: 'Amira', last_name: 'Benali', avatar_url: 'https://i.pravatar.cc/150?img=9' }, created_at: new Date(Date.now() - 1800000).toISOString(), channel_id: '1' },
  { id: '5', content: 'Oui c\'est depuis la tempête de la semaine dernière je pense', author: { id: '5', first_name: 'Marc', last_name: 'Lefèvre', avatar_url: 'https://i.pravatar.cc/150?img=11' }, created_at: new Date(Date.now() - 1200000).toISOString(), channel_id: '1' },
  { id: '6', content: 'J\'ai prévenu le syndic ce matin', author: { id: '2', first_name: 'Sophie', last_name: 'Martin', avatar_url: 'https://i.pravatar.cc/150?img=5' }, created_at: new Date(Date.now() - 600000).toISOString(), channel_id: '1' },
  { id: '7', content: 'Bonne soirée à tous !', author: { id: '2', first_name: 'Sophie', last_name: 'Martin', avatar_url: 'https://i.pravatar.cc/150?img=5' }, created_at: new Date(Date.now() - 60000).toISOString(), channel_id: '1' },
];

export const MOCK_RESIDENTS: Resident[] = [
  { id: '1', first_name: 'Renaud', last_name: 'Cosson', avatar_url: 'https://i.pravatar.cc/150?img=12', apartment_number: '4B', floor: 4, role: 'resident', phone: '06 12 34 56 78' },
  { id: '2', first_name: 'Sophie', last_name: 'Martin', avatar_url: 'https://i.pravatar.cc/150?img=5', apartment_number: '2A', floor: 2, role: 'council', phone: null },
  { id: '3', first_name: 'Pierre', last_name: 'Dubois', avatar_url: 'https://i.pravatar.cc/150?img=8', apartment_number: '3C', floor: 3, role: 'resident', phone: null },
  { id: '4', first_name: 'Amira', last_name: 'Benali', avatar_url: 'https://i.pravatar.cc/150?img=9', apartment_number: '5A', floor: 5, role: 'resident', phone: null },
  { id: '5', first_name: 'Marc', last_name: 'Lefèvre', avatar_url: 'https://i.pravatar.cc/150?img=11', apartment_number: '1B', floor: 1, role: 'resident', phone: null },
  { id: '6', first_name: 'Julie', last_name: 'Moreau', avatar_url: 'https://i.pravatar.cc/150?img=25', apartment_number: '6A', floor: 6, role: 'resident', phone: null },
  { id: '7', first_name: 'Thomas', last_name: 'Bernard', avatar_url: 'https://i.pravatar.cc/150?img=15', apartment_number: '2B', floor: 2, role: 'council', phone: null },
  { id: '8', first_name: 'Léa', last_name: 'Petit', avatar_url: 'https://i.pravatar.cc/150?img=32', apartment_number: '4A', floor: 4, role: 'resident', phone: null },
  { id: '9', first_name: 'Karim', last_name: 'Hassan', avatar_url: 'https://i.pravatar.cc/150?img=18', apartment_number: '3A', floor: 3, role: 'resident', phone: null },
  { id: '10', first_name: 'Emma', last_name: 'Garcia', avatar_url: 'https://i.pravatar.cc/150?img=26', apartment_number: '5B', floor: 5, role: 'resident', phone: null },
  { id: '11', first_name: 'Lucas', last_name: 'Roux', avatar_url: 'https://i.pravatar.cc/150?img=53', apartment_number: '1A', floor: 1, role: 'resident', phone: null },
  { id: '12', first_name: 'Chloé', last_name: 'Fournier', avatar_url: 'https://i.pravatar.cc/150?img=44', apartment_number: '6B', floor: 6, role: 'resident', phone: null },
];

export const MOCK_COMMENTS: Comment[] = [
  { id: '1', content: 'Merci pour l\'info ! On prendra les escaliers', author: { id: '3', first_name: 'Pierre', last_name: 'Dubois', avatar_url: 'https://i.pravatar.cc/150?img=8' }, created_at: new Date(Date.now() - 3200000).toISOString(), post_id: '1' },
  { id: '2', content: 'C\'est prévu pour combien de temps ?', author: { id: '4', first_name: 'Amira', last_name: 'Benali', avatar_url: 'https://i.pravatar.cc/150?img=9' }, created_at: new Date(Date.now() - 3000000).toISOString(), post_id: '1' },
  { id: '3', content: '3 jours normalement', author: { id: '2', first_name: 'Sophie', last_name: 'Martin', avatar_url: 'https://i.pravatar.cc/150?img=5' }, created_at: new Date(Date.now() - 2800000).toISOString(), post_id: '1' },
];
