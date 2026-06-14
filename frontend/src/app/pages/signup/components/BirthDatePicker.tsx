import { useMemo, useState } from "react";
import { ko, enUS } from "date-fns/locale";
import { Calendar } from "../../../components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { useTranslation } from "../../../i18n";

interface BirthDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const MIN_DATE = new Date(1900, 0, 1);

function formatBirthDate(date: Date) {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}${month}${day}`;
}

function parseBirthDate(value: string) {
  if (!/^\d{8}$/.test(value)) {
    return undefined;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

export function BirthDatePicker({ value, onChange }: BirthDatePickerProps) {
  const [isOpen, setOpen] = useState(false);
  const { t, language } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const selectedDate = useMemo(() => parseBirthDate(value), [value]);
  const calendarLocale = language === "en" ? enUS : ko;

  const handleSelect = (date?: Date) => {
    if (!date) {
      return;
    }

    onChange(formatBirthDate(date));
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block">{t('signup.birthDate')}</label>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className={`w-full rounded-lg border border-border bg-input-background px-4 py-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
              value ? "text-foreground" : "text-muted-foreground"
            }`}
            style={{ fontSize: "16px" }}
          >
            {value || t('signup.birthDatePlaceholder')}
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[78vh] overflow-y-auto rounded-t-2xl px-5 pb-6 pt-5">
          <SheetHeader className="p-0 pr-8">
            <SheetTitle>{t('signup.birthDateSheetTitle')}</SheetTitle>
            <SheetDescription>{t('signup.birthDateSheetDescription')}</SheetDescription>
          </SheetHeader>
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate ?? today}
            fromDate={MIN_DATE}
            toDate={today}
            captionLayout="dropdown-buttons"
            fromYear={1900}
            toYear={today.getFullYear()}
            locale={calendarLocale}
            onSelect={handleSelect}
            className="mx-auto"
            classNames={{
              vhidden: "sr-only",
              caption_label: "sr-only",
              caption_dropdowns: "flex items-center justify-center gap-2",
              dropdown_year: "order-1",
              dropdown_month: "order-2",
              dropdown:
                "rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
