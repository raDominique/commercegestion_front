import { Button } from '../ui/button';
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from '../ui/select';

const DEFAULT_LIMIT_OPTIONS = [10, 20, 50, 100];

const PaginationControls = ({
	page,
	total,
	limit,
	loading = false,
	onPageChange,
	onLimitChange,
	showLimitSelector = false,
	limitLabel = 'Par page',
	limitOptions = DEFAULT_LIMIT_OPTIONS,
	className = '',
}) => {
	const totalPages = Math.max(1, Math.ceil(Number(total || 0) / Number(limit || 1)));

	return (
		<div className={`flex flex-wrap justify-end items-center gap-4 ${className}`.trim()}>
			{showLimitSelector && onLimitChange && (
				<div className="flex items-center gap-2">
					<label className="text-sm text-neutral-600">{limitLabel}</label>
					<Select
						value={String(limit)}
						onValueChange={(value) => {
							onLimitChange(Number(value));
							onPageChange?.(1);
						}}
					>
						<SelectTrigger className="bg-white">
							<SelectValue placeholder={limitLabel} />
						</SelectTrigger>
						<SelectContent>
							{limitOptions.map((option) => (
								<SelectItem key={option} value={String(option)}>
									{option} / page
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			<Button
				variant="outline"
				size="sm"
				disabled={page === 1 || loading}
				onClick={() => onPageChange?.((p) => Math.max(1, p - 1))}
			>
				Précédent
			</Button>
			<span className="text-sm text-neutral-600">
				Page {page} / {totalPages}
			</span>
			<Button
				variant="outline"
				size="sm"
				disabled={page >= totalPages || loading}
				onClick={() => onPageChange?.((p) => p + 1)}
			>
				Suivant
			</Button>
		</div>
	);
};

export default PaginationControls;