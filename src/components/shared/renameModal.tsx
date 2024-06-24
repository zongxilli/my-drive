import { Dispatch, SetStateAction, useState } from 'react';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';

type RenameModalProps = {
	showModal: boolean;
	setShowModal: Dispatch<SetStateAction<boolean>>;
	onConfirm: (value: string) => void;
	initialValue?: string;
};

const RenameModal = ({
	showModal,
	setShowModal,
	onConfirm,
	initialValue = '',
}: RenameModalProps) => {
	const [newName, setNewName] = useState(initialValue);

	const renderRenameFileModal = () => {
		return (
			<AlertDialog open={showModal} onOpenChange={setShowModal}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Rename file</AlertDialogTitle>
						<AlertDialogDescription>
							Enter new file name here
						</AlertDialogDescription>
						<Input
							autoFocus
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
						/>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => onConfirm(newName)}>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	};

	return renderRenameFileModal();
};

export default RenameModal;
