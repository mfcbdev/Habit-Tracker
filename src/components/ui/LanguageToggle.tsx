import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useI18n } from '@/i18n/I18nProvider';
import { LANGUAGES, type Lang } from '@/i18n/dictionaries';

interface LanguageToggleProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function LanguageToggle({ size = 'sm', className }: LanguageToggleProps) {
  const { lang, setLang } = useI18n();
  return (
    <SegmentedControl<Lang>
      options={LANGUAGES}
      value={lang}
      onChange={setLang}
      size={size}
      className={className}
    />
  );
}
