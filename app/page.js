'use client';
import { useState } from 'react';

const CHEF_PHONE = '6577750608';

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState('');
  const [smsHref, setSmsHref] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    clientName: '', weekOf: '', overall: '', portions: '', variety: '',
    favMeal: '', leastMeal: '', mealNotes: '',
    reheat: '', issues: [], issueDetail: '',
    mood: [], requests: '', anythingElse: '',
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const toggleArr = (field, value) => setForm(f => ({
    ...f,
    [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value],
  }));

  function buildSummary(d) {
    const stars = d.overall ? '⭐'.repeat(parseInt(d.overall)) : '';
    const pMap = { too_small: 'Too small', just_right: 'Just right 👌', too_large: 'Too much' };
    const vMap = { loved_it: 'Loved it! 🤩', good: 'Good', okay: 'Okay', needs_work: 'Needs work' };
    const rMap = { great: 'Great 🔥', mostly_good: 'Mostly good 👍', some_issues: 'Some issues ⚠️' };
    const iMap = { dried_out: 'Dried out on reheat', soggy: 'Got soggy/mushy', freshness: 'Later-week meal not fresh', labels: 'Unclear reheating instructions', container: 'Container/packaging issue' };
    const mMap = { comfort: 'Comfort food', light: 'Lighter/healthier', adventurous: 'Something new', favorites: 'Repeat favorites' };

    const lines = [];
    lines.push(`WEEKLY FEEDBACK — ${d.clientName}`);
    lines.push(`Week of: ${d.weekOf}`);
    lines.push('');
    if (d.overall) lines.push(`Overall: ${stars} (${d.overall}/5)`);
    if (d.portions) lines.push(`Portions: ${pMap[d.portions] || d.portions}`);
    if (d.variety) lines.push(`Variety: ${vMap[d.variety] || d.variety}`);
    if (d.favMeal || d.leastMeal) {
      lines.push('');
      if (d.favMeal) lines.push(`🏆 Favorite: ${d.favMeal}`);
      if (d.leastMeal) lines.push(`👎 Least fav: ${d.leastMeal}`);
    }
    if (d.mealNotes) { lines.push(''); lines.push(`Meal notes: ${d.mealNotes}`); }
    if (d.reheat || d.issues.length) {
      lines.push('');
      if (d.reheat) lines.push(`Reheating: ${rMap[d.reheat] || d.reheat}`);
      if (d.issues.length) lines.push(`Issues: ${d.issues.map(i => iMap[i] || i).join(', ')}`);
      if (d.issueDetail) lines.push(`Details: ${d.issueDetail}`);
    }
    if (d.mood.length || d.requests) {
      lines.push('');
      lines.push('📅 Next week:');
      if (d.mood.length) lines.push(`Mood: ${d.mood.map(m => mMap[m] || m).join(', ')}`);
      if (d.requests) lines.push(`Requests: ${d.requests}`);
    }
    if (d.anythingElse) { lines.push(''); lines.push(`Other: ${d.anythingElse}`); }
    return lines.join('\n');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.clientName || !form.weekOf) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');

      const text = buildSummary(form);
      setSummary(text);

      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const sep = isIOS ? '&' : '?';
      setSmsHref(`sms:${CHEF_PHONE}${sep}body=${encodeURIComponent(text)}`);

      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. You can still copy your feedback and text it directly.');
      const text = buildSummary(form);
      setSummary(text);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const sep = isIOS ? '&' : '?';
      setSmsHref(`sms:${CHEF_PHONE}${sep}body=${encodeURIComponent(text)}`);
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  const S = {
    page: { fontFamily: "'Source Sans Pro', sans-serif", background: '#FDFBF7', minHeight: '100vh', color: '#2D2D2D' },
    topBar: { height: 6, background: 'linear-gradient(90deg, #2C5530, #4A9056, #2C5530)' },
    container: { maxWidth: 640, margin: '0 auto', padding: '40px 24px 60px' },
    header: { textAlign: 'center', marginBottom: 40 },
    chefName: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#2C5530', letterSpacing: 0.5 },
    tagline: { fontSize: 13, fontWeight: 300, color: '#6B6B6B', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 },
    divider: { width: 48, height: 2, background: '#4A9056', margin: '0 auto 24px' },
    h1: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: '#2D2D2D', marginBottom: 8 },
    subtitle: { fontSize: 15, color: '#6B6B6B', maxWidth: 440, margin: '0 auto' },
    card: { background: '#FFFEFA', border: '1px solid #E0DDD6', borderRadius: 12, padding: '28px 28px 24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(44,85,48,0.08)' },
    cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, color: '#2C5530', marginBottom: 4 },
    cardSub: { fontSize: 13, color: '#6B6B6B', marginBottom: 20 },
    label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#2D2D2D', marginBottom: 6 },
    input: { width: '100%', padding: '10px 14px', border: '1px solid #E0DDD6', borderRadius: 8, fontFamily: "'Source Sans Pro', sans-serif", fontSize: 15, color: '#2D2D2D', background: '#FDFBF7', boxSizing: 'border-box', outline: 'none' },
    field: { marginBottom: 18 },
    starRow: { display: 'flex', gap: 8, marginBottom: 8 },
    star: (active) => ({ fontSize: 36, cursor: 'pointer', color: active ? '#E8A835' : '#E0DDD6', transition: 'color 0.15s, transform 0.15s', lineHeight: 1 }),
    emojiRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 },
    emojiBtn: (active) => ({ padding: '10px 16px', border: `2px solid ${active ? '#4A9056' : '#E0DDD6'}`, borderRadius: 10, background: active ? '#F0F8F0' : '#FFFEFA', cursor: 'pointer', fontSize: 14, textAlign: 'center', minWidth: 80, transition: 'all 0.15s' }),
    checkRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer', fontSize: 14 },
    submitBtn: { display: 'block', width: '100%', fontFamily: "'Source Sans Pro', sans-serif", fontSize: 16, fontWeight: 600, color: '#fff', background: '#2C5530', border: 'none', borderRadius: 10, padding: '14px 48px', cursor: 'pointer', boxShadow: '0 2px 12px rgba(44,85,48,0.08)' },
    smsBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#2C5530', color: '#fff', fontFamily: "'Source Sans Pro', sans-serif", fontSize: 16, fontWeight: 600, border: 'none', borderRadius: 10, padding: '14px 24px', textDecoration: 'none', boxShadow: '0 2px 12px rgba(44,85,48,0.08)', width: '100%', boxSizing: 'border-box' },
    copyBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#FFFEFA', color: '#2C5530', fontFamily: "'Source Sans Pro', sans-serif", fontSize: 15, fontWeight: 600, border: '1px solid #E0DDD6', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', width: '100%', boxSizing: 'border-box' },
    footer: { textAlign: 'center', paddingTop: 32, fontSize: 12, color: '#6B6B6B', borderTop: '1px solid #E0DDD6', marginTop: 12 },
  };

  if (submitted) {
    return (
      <div style={S.page}>
        <div style={S.topBar} />
        <div style={S.container}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F0F8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36, color: '#2C5530' }}>✓</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#2C5530', marginBottom: 8 }}>Thank you!</h2>
            <p style={{ fontSize: 15, color: '#6B6B6B', maxWidth: 380, margin: '0 auto 8px' }}>
              Your feedback has been saved. You can also text it directly to Chef Iliana below.
            </p>
            {error && <p style={{ color: '#b45309', fontSize: 13, margin: '8px 0' }}>{error}</p>}
          </div>

          <div style={{ background: '#fff', border: '1px solid #E0DDD6', borderRadius: 12, padding: 20, margin: '24px 0', maxHeight: 280, overflowY: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: "'Source Sans Pro', sans-serif", fontSize: 14, lineHeight: 1.7, margin: 0, color: '#2D2D2D' }}>{summary}</pre>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
            <a href={smsHref} style={S.smsBtn}>💬 Text to Chef Iliana</a>
            <button style={S.copyBtn} onClick={() => { navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 2500); }}>
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>

          <div style={S.footer}>
            <span style={{ fontFamily: "'Playfair Display', serif", color: '#2C5530', fontWeight: 600 }}>Chef Iliana Stone</span> · Private Chef Services · Houston, TX
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.topBar} />
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.chefName}>Chef Iliana Stone</div>
          <div style={S.tagline}>Private Chef Services</div>
          <div style={S.divider} />
          <h1 style={S.h1}>Weekly Meal Prep Feedback</h1>
          <p style={S.subtitle}>Your feedback helps us make each week better. This only takes a couple of minutes.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* YOUR INFO */}
          <div style={S.card}>
            <div style={S.cardTitle}>Your Info</div>
            <div style={S.cardSub}>So we can match your feedback to the right week</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ ...S.field, flex: 1, minWidth: 180 }}>
                <label style={S.label}>Name</label>
                <input style={S.input} value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g., Greg Smith" required />
              </div>
              <div style={{ ...S.field, flex: 1, minWidth: 160 }}>
                <label style={S.label}>Week of</label>
                <input style={S.input} type="date" value={form.weekOf} onChange={e => set('weekOf', e.target.value)} required />
              </div>
            </div>
          </div>

          {/* OVERALL */}
          <div style={S.card}>
            <div style={S.cardTitle}>Overall Experience</div>
            <div style={S.cardSub}>How was this week's meal prep?</div>

            <label style={S.label}>Overall satisfaction</label>
            <div style={S.starRow}>
              {[1,2,3,4,5].map(n => (
                <span key={n} style={S.star(parseInt(form.overall) >= n)} onClick={() => set('overall', String(n))}>★</span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B6B6B', marginBottom: 18, padding: '0 2px' }}><span>Needs work</span><span>Excellent</span></div>

            <label style={S.label}>Portion sizes were…</label>
            <div style={S.emojiRow}>
              {[['too_small','😕','Too small'],['just_right','👌','Just right'],['too_large','😅','Too much']].map(([v,e,l]) => (
                <button key={v} type="button" style={S.emojiBtn(form.portions === v)} onClick={() => set('portions', v)}>
                  <div style={{ fontSize: 24 }}>{e}</div>{l}
                </button>
              ))}
            </div>

            <label style={S.label}>Variety and menu selection</label>
            <div style={S.emojiRow}>
              {[['loved_it','🤩','Loved it'],['good','😊','Good'],['okay','😐','Okay'],['needs_work','🤔','Needs work']].map(([v,e,l]) => (
                <button key={v} type="button" style={S.emojiBtn(form.variety === v)} onClick={() => set('variety', v)}>
                  <div style={{ fontSize: 24 }}>{e}</div>{l}
                </button>
              ))}
            </div>
          </div>

          {/* MEAL HIGHLIGHTS */}
          <div style={S.card}>
            <div style={S.cardTitle}>Meal Highlights</div>
            <div style={S.cardSub}>Which meals stood out — for better or worse?</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ ...S.field, flex: 1, minWidth: 180 }}>
                <label style={S.label}>🏆 Favorite meal</label>
                <input style={S.input} value={form.favMeal} onChange={e => set('favMeal', e.target.value)} placeholder="e.g., Greek Lemon Chicken" />
              </div>
              <div style={{ ...S.field, flex: 1, minWidth: 180 }}>
                <label style={S.label}>👎 Least favorite</label>
                <input style={S.input} value={form.leastMeal} onChange={e => set('leastMeal', e.target.value)} placeholder="e.g., Cioppino" />
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Any specific notes? <span style={{ fontWeight: 300, color: '#6B6B6B', fontSize: 12 }}>(optional)</span></label>
              <textarea style={{ ...S.input, minHeight: 70, resize: 'vertical' }} value={form.mealNotes} onChange={e => set('mealNotes', e.target.value)} placeholder="e.g., The salmon was incredible. The meatballs were a little dry." />
            </div>
          </div>

          {/* REHEATING */}
          <div style={S.card}>
            <div style={S.cardTitle}>Reheating &amp; Freshness</div>
            <div style={S.cardSub}>How did the meals hold up through the week?</div>

            <label style={S.label}>Reheating results</label>
            <div style={S.emojiRow}>
              {[['great','🔥','Great'],['mostly_good','👍','Mostly good'],['some_issues','⚠️','Some issues']].map(([v,e,l]) => (
                <button key={v} type="button" style={S.emojiBtn(form.reheat === v)} onClick={() => set('reheat', v)}>
                  <div style={{ fontSize: 24 }}>{e}</div>{l}
                </button>
              ))}
            </div>

            <label style={S.label}>Any issues? <span style={{ fontWeight: 300, color: '#6B6B6B', fontSize: 12 }}>(check all that apply)</span></label>
            {[['dried_out','A meal dried out when reheated'],['soggy','Something got soggy or mushy'],['freshness',"A later-week meal didn't taste fresh"],['labels','Reheating instructions were unclear'],['container','Container or packaging issue']].map(([v,l]) => (
              <div key={v} style={S.checkRow} onClick={() => toggleArr('issues', v)}>
                <input type="checkbox" checked={form.issues.includes(v)} readOnly style={{ accentColor: '#4A9056' }} />
                <span>{l}</span>
              </div>
            ))}
            <div style={{ ...S.field, marginTop: 12 }}>
              <label style={S.label}>Details <span style={{ fontWeight: 300, color: '#6B6B6B', fontSize: 12 }}>(optional)</span></label>
              <textarea style={{ ...S.input, minHeight: 50, resize: 'vertical' }} value={form.issueDetail} onChange={e => set('issueDetail', e.target.value)} placeholder="e.g., Day 4 fish was a little off." />
            </div>
          </div>

          {/* LOOKING AHEAD */}
          <div style={S.card}>
            <div style={S.cardTitle}>Looking Ahead</div>
            <div style={S.cardSub}>Help us plan next week</div>

            <label style={S.label}>What are you in the mood for? <span style={{ fontWeight: 300, color: '#6B6B6B', fontSize: 12 }}>(select any)</span></label>
            {[['comfort','Comfort food / hearty meals'],['light','Lighter / healthier options'],['adventurous','Something new and adventurous'],['favorites','Repeat some favorites from past weeks']].map(([v,l]) => (
              <div key={v} style={S.checkRow} onClick={() => toggleArr('mood', v)}>
                <input type="checkbox" checked={form.mood.includes(v)} readOnly style={{ accentColor: '#4A9056' }} />
                <span>{l}</span>
              </div>
            ))}

            <div style={{ ...S.field, marginTop: 12 }}>
              <label style={S.label}>Any requests or things to avoid? <span style={{ fontWeight: 300, color: '#6B6B6B', fontSize: 12 }}>(optional)</span></label>
              <textarea style={{ ...S.input, minHeight: 70, resize: 'vertical' }} value={form.requests} onChange={e => set('requests', e.target.value)} placeholder="e.g., More chicken dishes please. No seafood next week." />
            </div>

            <div style={S.field}>
              <label style={S.label}>Anything else? <span style={{ fontWeight: 300, color: '#6B6B6B', fontSize: 12 }}>(optional)</span></label>
              <textarea style={{ ...S.input, minHeight: 50, resize: 'vertical' }} value={form.anythingElse} onChange={e => set('anythingElse', e.target.value)} placeholder="General comments, schedule changes, etc." />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button type="submit" style={{ ...S.submitBtn, opacity: submitting ? 0.6 : 1 }} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 12 }}>Your responses go directly to Chef Iliana&apos;s planning system</div>
          </div>

          <div style={S.footer}>
            <span style={{ fontFamily: "'Playfair Display', serif", color: '#2C5530', fontWeight: 600 }}>Chef Iliana Stone</span> · Private Chef Services · Houston, TX
          </div>
        </form>
      </div>
    </div>
  );
}
