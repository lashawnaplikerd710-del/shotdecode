function labelText(key, ...values) {
  if (typeof key !== 'string') return key;
  const language = document.documentElement.lang;
  const primary = interfaceDictionary[language]?.[key] ?? key;
  return values.length ? primary.replace(/\{(\d+)\}/g, (match,index) => values[index] ?? match) : primary;
}

function useInterfacePreferences(settings) {
  if (settings?.ui_language) document.documentElement.lang = settings.ui_language;
  const mode = settings?.color_mode;
  j.useLayoutEffect(() => {
    if (!mode) return;
    const system = matchMedia('(prefers-color-scheme: light)');
    const apply = () => {
      const light = mode==='light' || mode==='system' && system.matches;
      document.documentElement.dataset.theme = light ? 'light' : 'dark';
      document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', light ? 'light' : 'dark');
    };
    apply();
    if (mode==='system') {
      system.addEventListener('change',apply);
      return () => system.removeEventListener('change',apply);
    }
  },[mode]);
}

function InterfaceSettings({ settings, command }) {
  const languages = [['zh-CN','简体中文'],['zh-TW','繁體中文'],['en','English'],['ja','日本語'],['es','Español']];
  const modes = [['dark','深色'],['light','浅色'],['system','跟随系统']];
  const [switching,setSwitching] = j.useState(false);
  async function change(field,value) {
    setSwitching(true);
    try { await command('interface_preferences',{[field]:value}); }
    finally { setSwitching(false); }
  }
  return <section className="settings-card">
    <h4>界面与外观</h4>
    <div className="settings-fields-grid">
      <label className="tool-field"><span>界面语言</span>
        <select aria-label="界面语言" value={settings.ui_language} disabled={switching} onChange={event=>change('ui_language',event.target.value)}>
          {languages.map(([code,native])=><option value={code} key={code}>{native}</option>)}
        </select>
      </label>
      <label className="tool-field"><span>颜色模式</span>
        <select aria-label="颜色模式" value={settings.color_mode} disabled={switching} onChange={event=>change('color_mode',event.target.value)}>
          {modes.map(([mode,label])=><option value={mode} key={mode}>{label}</option>)}
        </select>
      </label>
    </div>
  </section>;
}
