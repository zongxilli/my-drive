import { useEffect } from 'react';

import { useOrganization } from '@clerk/nextjs';

const useAdminPermission = () => {
	const organization = useOrganization();

	return (
		organization.organization === null ||
		organization.membership?.role === 'org:admin'
	);
};

export default useAdminPermission;
