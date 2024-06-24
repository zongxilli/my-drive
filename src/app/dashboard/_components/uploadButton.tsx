'use client';

import { useState } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Plus } from 'lucide-react';

import { api } from '../../../../convex/_generated/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { fileTypes } from '../../../../convex/schema';
import useUserIdentity, { UserIdentity } from '@/hooks/useUserIdentity';

const formSchema = z.object({
	title: z.string().min(1).max(200),
	file: z
		.custom<FileList>((val) => val instanceof FileList, 'Required')
		.refine((files) => files.length > 0, 'Required'),
});

const UploadButton = () => {
	const { shouldDisableAll } = useUserIdentity();
	const { toast } = useToast();
	const organization = useOrganization();
	const user = useUser();

	let orgId = null;
	if (organization.isLoaded && user.isLoaded) {
		orgId = organization.organization?.id ?? user.user?.id;
	}

	const createFile = useMutation(api.files.createFile);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			file: undefined,
		},
	});
	const fileRef = form.register('file');

	const [showUploadFileModal, setShowUploadFileModal] = useState(false);

	const generateUploadUrl = useMutation(api.files.generateUploadUrl);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!orgId) return;

		const postUrl = await generateUploadUrl();

		const fileType = values.file[0]!.type;

		const result = await fetch(postUrl, {
			method: 'POST',
			headers: { 'Content-Type': fileType },
			body: values.file[0],
		});
		const { storageId } = await result.json();

		try {
			await createFile({
				name: values.title,
				fileId: storageId,
				type: fileTypes[fileType],
				orgId: orgId,
			});

			form.reset();
			setShowUploadFileModal(false);
			toast({
				variant: 'success',
				title: 'File uploaded',
				description: 'Now everyone can view your file',
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

	return (
		<Dialog
			open={showUploadFileModal}
			onOpenChange={(isOpen) => {
				setShowUploadFileModal(isOpen);
				form.reset();
			}}
		>
			<DialogTrigger asChild>
				<Button
					disabled={shouldDisableAll}
					variant='outline'
					className='h-[3.5rem] w-[6.25rem] rounded-2xl flex items-center gap-3 shadow'
				>
					<Plus />
					<div className='text-base'>New</div>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className='mb-8'>Upload file</DialogTitle>
					<DialogDescription>
						This file will be accessible by anyone in your
						organization
					</DialogDescription>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='space-y-8'
						>
							<FormField
								control={form.control}
								name='title'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='file'
								render={() => (
									<FormItem>
										<FormLabel>File</FormLabel>
										<FormControl>
											<Input type='file' {...fileRef} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type='submit'
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting && (
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								)}
								Submit
							</Button>
						</form>
					</Form>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};

export default UploadButton;
