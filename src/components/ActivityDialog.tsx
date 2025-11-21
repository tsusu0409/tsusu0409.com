// src/components/ArticleDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  title: string;
  description: string;
  startDate: string;
  endDate?: string | number;
  children?: React.ReactNode;
}

export function ActivityDialog({ title, description, startDate, endDate, children }: Props) {
  const showEndDate = endDate && endDate !== 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <article className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between border-b border-neutral-200 py-6 hover:bg-gray-100 cursor-pointer">
          <div className="mx-4">
            <h3 className="text-base font-normal">{title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          </div>

          <div className="flex sm:flex-shrink-0 items-start sm:items-center py-4 whitespace-nowrap text-sm text-neutral-500 mt-4 sm:mt-0 mx-4 sm:mx-0">
            <p className="pr-4">{startDate}</p>
            <div className="w-[6.5em]">
              {showEndDate && (
                <div className="flex items-end">
                  <span className="pr-4">-</span>
                  <p>{endDate}</p>
                </div>
              )}
            </div>
          </div>
        </article>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="prose prose-neutral mt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}