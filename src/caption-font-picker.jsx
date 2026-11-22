function CaptionFontPicker({ font, text, systemFonts, disabled, onSelect, children }) {
  const [open, setOpen] = j.useState(false);
  const [group, setGroup] = j.useState('en');
  const [query, setQuery] = j.useState('');
  const [limit, setLimit] = j.useState(12);
  const trigger = j.useRef(null);
  const results = j.useRef(null);
  const panelId = j.useId();
  const groups = {
    zh: { label:'中文', sample:'视频字幕，字体预览' },
    ja: { label:'日语', sample:'今日は字幕を編集します。' },
    en: { label:'英语', sample:'The quick brown fox' },
    es: { label:'西班牙语', sample:'¿Qué tal? ¡Año nuevo!' },
    system: { label:'本机', sample:'字幕预览 Caption' },
  };
  const current = captionFontCatalog.find((entry) => entry.name.toLowerCase() === font.toLowerCase());
  const needle = query.trim().toLowerCase();
  const entries = group === 'system'
    ? [...new Set([...(current ? [] : [font]), ...(systemFonts || [])])]
        .filter((name) => !captionBundledFamilies.has(name.toLowerCase()))
        .map((name) => ({name}))
    : captionFontCatalog.filter((entry) => entry.group === group);
  const matching = entries.filter(({name}) => captionFontLabel(name).toLowerCase().includes(needle));

  function scrollToTop() {
    setLimit(12);
    if (results.current) results.current.scrollTop = 0;
  }

  function switchGroup(next) {
    setGroup(next);
    setQuery('');
    scrollToTop();
  }

  function openPicker() {
    let initial = current?.group;
    if (!initial) {
      if (/[ぁ-ゖァ-ヺ]/u.test(text)) initial = 'ja';
      else if (!text.trim() || /\p{Script=Han}/u.test(text)) initial = 'zh';
      else if (/[áéíóúñü¿¡]/iu.test(text)) initial = 'es';
      else initial = /[a-z]/i.test(text) ? 'en' : 'system';
    }
    switchGroup(initial);
    setOpen(true);
  }

  return <>
    <div className="manual-caption-font-row">
      <div className="tool-field">
        <span>字体</span>
        <button ref={trigger} type="button" className="caption-font-trigger" disabled={disabled}
          aria-label={'字体 · '+captionFontLabel(font)} aria-expanded={open} aria-controls={open ? panelId : undefined}
          title={captionFontLabel(font)} onClick={() => open ? setOpen(false) : openPicker()}>
          <span>{captionFontLabel(font)}</span><span className="caption-font-chevron" aria-hidden="true" />
        </button>
      </div>
      {children}
    </div>
    {open && <div id={panelId} className="caption-font-picker" role="group" aria-label="字体库"
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || event.nativeEvent.isComposing) return;
        event.stopPropagation();
        setOpen(false);
        trigger.current?.focus();
      }}>
      <div className="caption-font-groups" role="group" aria-label="字体语言">
        {Object.entries(groups).map(([id,{label}]) => <button key={id} type="button" aria-pressed={group === id}
          disabled={disabled} onClick={() => switchGroup(id)}>{label}</button>)}
      </div>
      <input type="search" className="caption-font-search" autoFocus value={query} disabled={disabled}
        aria-label="搜索字体" placeholder="搜索字体" onChange={(event) => {setQuery(event.target.value);scrollToTop();}} />
      <div className="caption-font-list" ref={results} aria-label={groups[group].label+'字体'}>
        {matching.slice(0,limit).map(({name,locale}) => <button key={name} type="button" className="caption-font-option"
          disabled={disabled} aria-pressed={name.toLowerCase() === font.toLowerCase()}
          aria-label={captionFontLabel(name)} onClick={() => onSelect(name)}>
          <span className="caption-font-option-name" title={captionFontLabel(name)}>{captionFontLabel(name)}</span>
          <span className="caption-font-sample" lang={locale || (group === 'system' ? undefined : group)} aria-hidden="true"
            style={{fontFamily:captionFontFamily(name)}}>{locale === 'zh-Hant' ? '影片字幕，字體預覽' : groups[group].sample}</span>
        </button>)}
        {!matching.length && <p className="caption-font-empty">
          {group === 'system' && systemFonts === null ? '正在读取本机字体…' : '未找到匹配的字体。'}
        </p>}
        {matching.length > limit && <button type="button" className="caption-font-more" disabled={disabled}
          onClick={() => setLimit((value) => value+12)}>显示更多字体（剩余 {matching.length-limit} 款）</button>}
      </div>
    </div>}
  </>;
}
