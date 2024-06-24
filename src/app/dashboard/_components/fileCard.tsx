'use client';

import { ReactNode, useState } from 'react';

import clsx from 'clsx';
import { useMutation, useQuery } from 'convex/react';
import {
	CopyPlus,
	EllipsisVerticalIcon,
	ExternalLink,
	History,
	Pencil,
	Star,
	StarOff,
	Trash,
	Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { IoImages } from 'react-icons/io5';
import { LuText } from 'react-icons/lu';
import { MdPictureAsPdf } from 'react-icons/md';
import { PiFilePdfLight, PiFileCsvLight } from 'react-icons/pi';

import { RenameModal } from '@/components/shared';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useUserIdentity } from '@/hooks';
import { formatUtils } from '@/utils/format';

import { api } from '../../../../convex/_generated/api';
import { Doc } from '../../../../convex/_generated/dataModel';
import { FileWithStarred } from '../../../../convex/files';

type FileCardProps = {
	file: FileWithStarred;
	listView: boolean;
};

const FileCard = ({ file, listView }: FileCardProps) => {
	const { toast } = useToast();
	const { userId } = useUserIdentity();

	const createFile = useMutation(api.files.createFile);
	const renameFile = useMutation(api.files.renameFile);
	const deleteFile = useMutation(api.files.deleteFile);
	const restoreFile = useMutation(api.files.restoreFile);
	const moveFileToTrash = useMutation(api.files.moveFileToTrash);
	const toggleStar = useMutation(api.files.toggleStar);
	const userProfile = useQuery(api.users.getUserProfile, {
		userId: file.userId,
	});
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const organizationImages =
		useQuery(api.users.getUserOrganizationImages) ?? {};

	const [showRenameFileModal, setShowRenameFileModal] = useState(false);
	const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);

	const fileIcons = {
		image: <IoImages className='h-4 w-4 flex-shrink-0 text-blue-600' />,
		pdf: <MdPictureAsPdf className=' h-4 w-4 flex-shrink-0 text-red-600' />,
		csv: <LuText className=' h-4 w-4 flex-shrink-0 text-gray-600' />,
	} as Record<Doc<'files'>['type'], ReactNode>;

	const handleMoveToTrash = async () => {
		await moveFileToTrash({ fileId: file._id });

		toast({
			variant: 'destructive',
			title: 'File moved to trash',
			description: 'This file will be deleted in 7 days',
		});
	};

	const handleDelete = async () => {
		await deleteFile({ fileId: file._id });

		toast({
			variant: 'destructive',
			title: 'File deleted',
			description: 'This file has been permanently removed',
		});
	};

	const handleRestore = async () => {
		await restoreFile({ fileId: file._id });

		toast({
			variant: 'success',
			title: 'File restored',
			description: 'This file has been moved back to all files',
		});
	};

	const handleAddFileTo = async (targetId: string) => {
		try {
			const postUrl = await generateUploadUrl();

			const response = await fetch(file.url);
			if (!response.ok) {
				throw new Error('Failed to fetch file from URL');
			}
			const fileBlob = await response.blob();

			const result = await fetch(postUrl, {
				method: 'POST',
				headers: { 'Content-Type': fileBlob.type },
				body: fileBlob,
			});
			const { storageId } = await result.json();

			await createFile({
				name: file.name,
				fileId: storageId,
				type: file.type,
				orgId: targetId,
			});

			toast({
				variant: 'success',
				title: 'File uploaded',
				description: 'File added to personal drive successfully',
			});
		} catch {
			toast({
				variant: 'destructive',
				title: 'Something went wrong',
				description:
					'Your file could not be uploaded, please try again later',
			});
		}
	};

	const renderDropdownMenu = () => {
		const renderDropdownMenuItem = (
			icon: ReactNode,
			label: string,
			onClickHandler: () => void,
			warning?: boolean,
			show?: boolean,
			disabled?: boolean
		) => {
			if (!show) return null;

			return (
				<DropdownMenuItem
					className={clsx('flex items-center gap-2 cursor-pointer', {
						' text-red-600': warning,
					})}
					onClick={onClickHandler}
					disabled={disabled}
					key={label}
				>
					{icon}
					{label}
				</DropdownMenuItem>
			);
		};

		const renderAddToOrganizationsDropdownItem = () => {
			return (
				<DropdownMenuSub>
					<DropdownMenuSubTrigger className='flex items-center gap-2 cursor-pointer'>
						<CopyPlus className='w-4 h-4' />
						Duplicate to
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							{renderDropdownMenuItem(
								<Avatar className='w-4 h-4'>
									<AvatarImage src={userProfile?.image} />
									<AvatarFallback>
										{userProfile?.name}
									</AvatarFallback>
								</Avatar>,
								'Personal drive',
								() => handleAddFileTo(userId!),
								false,
								true,
								file.orgId === userId
							)}

							<DropdownMenuSeparator />

							{userProfile?.orgIds?.map((org) =>
								renderDropdownMenuItem(
									<Avatar className='w-4 h-4'>
										<AvatarImage
											src={organizationImages[org.orgId]}
										/>
										<AvatarFallback>
											{org.name}
										</AvatarFallback>
									</Avatar>,
									org.name,
									() => handleAddFileTo(org.orgId!),
									false,
									true,
									org.orgId === file.orgId
								)
							)}
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
			);
		};

		const renderCommonDropdownItems = () => {
			return (
				<>
					{renderDropdownMenuItem(
						<ExternalLink className='w-4 h-4' />,
						'Open',
						() => window.open(file.url, '_blank'),
						false,
						true,
						false
					)}
					{renderDropdownMenuItem(
						<Pencil className='w-4 h-4' />,
						'Rename',
						() => setShowRenameFileModal(true),
						false,
						true,
						false
					)}
					{renderDropdownMenuItem(
						<StarOff className='w-4 h-4' />,
						'Remove from starred',
						() => toggleStar({ fileId: file._id }),
						false,
						file.isStarred,
						false
					)}
					{renderDropdownMenuItem(
						<Star className='w-4 h-4' />,
						'Add to starred',
						() => toggleStar({ fileId: file._id }),
						false,
						!file.isStarred,
						false
					)}
					{renderAddToOrganizationsDropdownItem()}
				</>
			);
		};

		const renderDangerDropdownItems = () => {
			return (
				<>
					{renderDropdownMenuItem(
						<History className='w-4 h-4' />,
						'Restore',
						handleRestore,
						false,
						file.movedToTrash,
						false
					)}
					{renderDropdownMenuItem(
						<Trash className='w-4 h-4' />,
						'Move to trash',
						handleMoveToTrash,
						true,
						!file.movedToTrash,
						false
					)}
					{renderDropdownMenuItem(
						<Trash2 className='w-4 h-4' />,
						'Delete forever',
						() => setShowDeleteFileModal(true),
						true,
						file.movedToTrash,
						false
					)}
				</>
			);
		};

		return (
			<DropdownMenu>
				<DropdownMenuTrigger>
					<EllipsisVerticalIcon size={20} />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{renderCommonDropdownItems()}
					<DropdownMenuSeparator />
					{renderDangerDropdownItems()}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	};

	const renderRenameFileModal = () => {
		const handleRename = async (newName: string) => {
			await renameFile({ fileId: file._id, name: newName });

			toast({
				variant: 'success',
				title: 'File renamed',
				description: 'This file has been successfully renamed',
			});
		};

		return (
			<RenameModal
				showModal={showRenameFileModal}
				setShowModal={setShowRenameFileModal}
				onConfirm={handleRename}
				initialValue={file.name}
			/>
		);
	};

	const renderDeleteFileModal = () => {
		return (
			<AlertDialog
				open={showDeleteFileModal}
				onOpenChange={setShowDeleteFileModal}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action will permanently delete the file.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete}>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	};

	const renderGridFileCard = () => {
		if (listView) return null;

		return (
			<Card className='h-[15.625rem] rounded-xl bg-google-lightBlue'>
				<CardHeader className='p-4'>
					<div className='w-full flex items-center gap-2'>
						{fileIcons[file.type]}
						<div className='flex-grow text-ellipsis whitespace-nowrap overflow-hidden min-w-0 text-base cursor-default'>
							{file.name}
						</div>
						{renderDropdownMenu()}
					</div>
				</CardHeader>
				<div className='w-full h-[60%] px-2 flex justify-center items-center'>
					{file.type === 'image' && (
						<Image
							src={file.url}
							alt={file.name}
							width='200'
							height='200'
							className='w-full h-full rounded-md object-cover'
						/>
					)}
					{file.type === 'pdf' && (
						<PiFilePdfLight className='w-20 h-20' />
					)}
					{file.type === 'csv' && (
						<PiFileCsvLight className='w-20 h-20' />
					)}
				</div>
				<CardFooter className='py-3 px-3 flex items-center justify-start gap-4'>
					<Avatar className='w-5 h-5'>
						<AvatarImage src={userProfile?.image} />
						<AvatarFallback>user image</AvatarFallback>
					</Avatar>
					<div className='text-sm text-gray-500 flex items-center gap-2 cursor-default'>
						<div>{userProfile?.name}</div>
						<div>&middot;</div>
						<div>{formatUtils.formatDate(file._creationTime)}</div>
					</div>
				</CardFooter>
			</Card>
		);
	};

	const renderListFileCard = () => {
		if (!listView) return null;

		return (
			<Card className='h-12 py-2 px-4 flex items-center gap-4'>
				<div>{fileIcons[file.type]}</div>
				<div className='flex-grow text-ellipsis whitespace-nowrap overflow-hidden min-w-0 text-base cursor-default'>
					{file.name}
				</div>
				<div className='w-[6rem] lg:w-[10rem] flex items-center justify-start gap-2 flex-shrink-0'>
					<Avatar className='w-5 h-5'>
						<AvatarImage src={userProfile?.image} />
						<AvatarFallback>user image</AvatarFallback>
					</Avatar>
					<div className='text-ellipsis whitespace-nowrap overflow-hidden min-w-0 text-sm text-gray-500'>
						{userProfile?.name}
					</div>
				</div>
				<div className='w-[9rem] lg:w-[12rem] flex-shrink-0 text-sm text-gray-500 flex items-center justify-start gap-2 cursor-default'>
					Created on {formatUtils.formatDate(file._creationTime)}
				</div>
				<div className='h-5'>{renderDropdownMenu()}</div>
			</Card>
		);
	};

	return (
		<>
			{renderListFileCard()}
			{renderGridFileCard()}
			{renderDeleteFileModal()}
			{renderRenameFileModal()}
		</>
	);
};

export default FileCard;
