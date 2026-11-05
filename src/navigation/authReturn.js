/** My Properties is the Profile tab, not a second stack screen. */
export function getAuthReturnState(returnTo, routes) {
 if (returnTo === 'MyProperties') return { index: 0, routes: [{ name: 'MainTabs', params: { screen: 'Profile' } }] };
 if (returnTo !== 'AddProperty' && returnTo !== 'EditProfile') return { index: 0, routes: [{ name: 'MainTabs' }] };
 // Reopen Edit Profile after sign-in so it loads the newly authenticated user.
 if (returnTo === 'EditProfile') return { index: 1, routes: [{ name: 'MainTabs', params: { screen: 'Profile' } }, { name: 'EditProfile' }] };
 const targetIndex = routes.findIndex(route => route.name === 'AddProperty');
 if (targetIndex >= 0) return { index: targetIndex, routes: routes.slice(0, targetIndex + 1) };
 return { index: 1, routes: [{ name: 'MainTabs' }, { name: 'AddProperty' }] };
}
