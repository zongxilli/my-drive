'use client';

import { Dispatch, SetStateAction } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { SearchIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
	query: z.string().min(0).max(200),
});

type SearchBarProps = {
	setSearchQuery: Dispatch<SetStateAction<string>>;

	disabled?: boolean;
};

const SearchBar = ({
	setSearchQuery,

	disabled,
}: SearchBarProps) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			query: '',
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setSearchQuery(values.query);
	};

	return (
		<Form {...form}>
			<form onChange={form.handleSubmit(onSubmit)} className='space-y-8'>
				<FormField
					control={form.control}
					name='query'
					render={({ field }) => (
						<FormItem className='relative w-[30rem]'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<SearchIcon className='h-5 w-5 text-gray-500' />
							</div>
							<FormControl>
								<Input
									{...field}
									disabled={disabled}
									placeholder='Search in Drive'
									className='pl-10 rounded-full bg-google-lightBlue focus:bg-white'
								/>
							</FormControl>
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
};

export default SearchBar;
