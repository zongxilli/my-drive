import { useOrganization, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export enum UserIdentity {
	organization = 'organization',
	individual = 'individual',
}

const useUserIdentity = () => {
	const [identity, setIdentity] = useState<UserIdentity | null>(null);
	const organization = useOrganization();
	const user = useUser();
	const orgId = organization.organization?.id;
	const userId = user.user?.id;

	useEffect(() => {
		if (organization.isLoaded && user.isLoaded) {
			if (organization.organization) {
				setIdentity(UserIdentity.organization);
			} else {
				setIdentity(UserIdentity.individual);
			}
		}
	}, [organization, user]);

	return {
		status: identity,
		userId,
		orgId,
	};
};

export default useUserIdentity;