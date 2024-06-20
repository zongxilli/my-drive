'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Loader2, SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dispatch, SetStateAction } from 'react';

const formSchema = z.object({
	query: z.string().min(0).max(200),
});

type SearchBarProps = {
	searchQuery: string;
	setSearchQuery: Dispatch<SetStateAction<string>>;
};

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
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
									placeholder='Search in Drive'
									className='pl-10 rounded-full bg-google-lightBlue focus:bg-white'
								/>
							</FormControl>
							{/* <FormMessage /> */}
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
};

export default SearchBar;
