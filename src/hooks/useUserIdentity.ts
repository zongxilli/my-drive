import { useOrganization, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export enum UserIdentity {
	organization = 'organization',
	individual = 'individual',
	notSignedIn = 'notSignedIn', // not logged in
	unknown = 'unknown', // initial value
}

const useUserIdentity = () => {
	const [identity, setIdentity] = useState<UserIdentity>(
		UserIdentity.unknown
	);
	const organization = useOrganization();
	const user = useUser();

	const orgId = organization.organization?.id;
	const userId = user.user?.id;

	useEffect(() => {
		if (organization.isLoaded && user.isLoaded) {
			if (user.isSignedIn) {
				if (organization.organization) {
					setIdentity(UserIdentity.organization);
				} else {
					setIdentity(UserIdentity.individual);
				}
			} else {
				setIdentity(UserIdentity.notSignedIn);
			}
		}
	}, [organization, user]);

	return {
		status: identity,
		userId,
		orgId,
		shouldDisableAll:
			identity === UserIdentity.unknown ||
			identity === UserIdentity.notSignedIn,
	};
};

export default useUserIdentity;
