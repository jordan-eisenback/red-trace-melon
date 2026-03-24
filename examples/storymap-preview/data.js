// Sample STORY_MAP data used by the preview
window.STORY_MAP = {
  title: 'Onboarding Story Map',
  activities: [
    { id: 'a1', title: 'Sign up & Account', order: 1, cards: [
      { id: 's1', title: 'Create account', order: 1, status: 'todo', estimate: '3', acceptanceCriteria: ['User can create an account with email','Password meets policy'] },
      { id: 's2', title: 'Confirm email', order: 2, status: 'todo', estimate: '1', acceptanceCriteria: ['Email contains confirmation link'] }
    ]},
    { id: 'a2', title: 'Profile Setup', order: 2, cards: [
      { id: 's3', title: 'Add personal details', order: 1, status: 'todo', estimate: '2', acceptanceCriteria: ['User can edit name and avatar'] },
      { id: 's4', title: 'Choose preferences', order: 2, status: 'todo', estimate: '2' }
    ]},
    { id: 'a3', title: 'First Experience', order: 3, cards: [
      { id: 's5', title: 'Complete tutorial', order: 1, status: 'todo', estimate: '5' },
      { id: 's6', title: 'Create first project', order: 2, status: 'todo', estimate: '3' }
    ]}
  ]
};
