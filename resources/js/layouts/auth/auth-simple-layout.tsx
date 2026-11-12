import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Network, ShieldCheck } from 'lucide-react';
import { home } from '@/routes';

const authCss = `
.na-auth,.na-auth *{box-sizing:border-box}.na-auth{min-height:100svh;display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.9fr);font-family:Instrument Sans,Arial,sans-serif;color:#10213e;background:#f7faff}.na-auth-main{display:flex;flex-direction:column;min-height:100svh;padding:34px clamp(24px,7vw,100px)}.na-auth-brand{display:inline-flex;align-items:center;gap:10px;width:max-content;color:#0d2040;text-decoration:none;font-weight:800;letter-spacing:.12em;font-size:15px}.na-auth-mark{width:38px;height:38px;display:grid;place-items:center;border-radius:11px;background:#1769e8;color:white;box-shadow:0 8px 20px #1769e833}.na-auth-content{width:min(100%,420px);margin:auto}.na-auth-heading{margin-bottom:28px}.na-auth-heading h1{font-size:30px;line-height:1.2;letter-spacing:-.8px;color:#0b1f3c;margin:0 0 9px;font-weight:800}.na-auth-heading p{margin:0;color:#61738a;font-size:15px;line-height:1.65}.na-auth-form{display:flex;flex-direction:column;gap:23px}.na-auth-form [data-slot=label]{color:#294365;font-size:13px;font-weight:700}.na-auth-form [data-slot=input]{height:46px;border:1px solid #d6e1ee;border-radius:9px;background:#fff;color:#10213e;padding:0 13px;box-shadow:none}.na-auth-form [data-slot=input]:focus-visible{border-color:#1769e8;box-shadow:0 0 0 3px #1769e81c}.na-auth-form [data-slot=button]{height:46px;border-radius:9px;background:#1769e8;color:white;font-weight:750;box-shadow:0 9px 18px #1769e82b}.na-auth-form [data-slot=button]:hover{background:#0956cf}.na-auth-form a{color:#1769e8;font-weight:650}.na-auth-switch{text-align:center;color:#61738a;font-size:14px;margin-top:24px}.na-auth-status{margin-bottom:16px;text-align:center;color:#129c58;font-size:14px}.na-auth-aside{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:48px;background:linear-gradient(145deg,#edf5ff,#f7faff)}.na-auth-aside:before,.na-auth-aside:after{content:'';position:absolute;border:1px solid #d8e8fb;border-radius:50%;width:460px;height:460px}.na-auth-aside:after{width:620px;height:620px}.na-auth-aside-inner{position:relative;z-index:1;width:min(100%,520px)}.na-auth-map{padding:13px;background:#0b2347;border-radius:20px;box-shadow:0 30px 60px #183c7126}.na-auth-map-inner{padding:20px;background:linear-gradient(135deg,#102e59,#0c2040);border:1px solid #315681;border-radius:13px}.na-auth-map-title{display:flex;justify-content:space-between;gap:12px;align-items:center;color:#dcecff;font-size:13px;font-weight:700}.na-auth-map-status{display:flex;align-items:center;gap:6px;color:#74e0ad;font-size:11px}.na-auth-map svg{display:block;width:100%;height:auto;margin-top:10px}.na-auth-aside-copy{margin:28px 8px 0}.na-auth-aside-copy h2{margin:0 0 10px;color:#10213e;font-size:25px;line-height:1.25;letter-spacing:-.5px}.na-auth-aside-copy p{margin:0;color:#5b6d85;font-size:15px;line-height:1.75}.na-auth-assurance{display:flex;align-items:center;gap:9px;margin:20px 8px 0;color:#53637a;font-size:13px;font-weight:650}.na-auth-assurance svg{color:#1769e8}@media(max-width:900px){.na-auth{grid-template-columns:1fr}.na-auth-main{padding:24px clamp(22px,7vw,70px);min-height:100svh}.na-auth-content{margin:auto}.na-auth-aside{display:none}}@media(max-width:480px){.na-auth-main{padding:20px 22px}.na-auth-heading h1{font-size:27px}}
`;

function Brand() {
    return (
        <Link href={home()} className="na-auth-brand">
            <span className="na-auth-mark"><Network size={20} /></span>
            NETATLAS
        </Link>
    );
}

function NetworkIllustration() {
    return (
        <div className="na-auth-aside">
            <div className="na-auth-aside-inner">
                <div className="na-auth-map"><div className="na-auth-map-inner">
                    <div className="na-auth-map-title"><span>Network topology</span><span className="na-auth-map-status"><i>●</i> All systems operational</span></div>
                    <svg viewBox="0 0 520 300" role="img" aria-label="Network topology illustration">
                        <g fill="none" stroke="#4e8cda" strokeWidth="2"><path d="M260 75v58M260 133 120 225M260 133l140 92M260 133v92" /></g>
                        <g fill="#7ab4ff"><circle cx="260" cy="75" r="4"/><circle cx="260" cy="133" r="4"/><circle cx="120" cy="225" r="4"/><circle cx="400" cy="225" r="4"/></g>
                        <g fontFamily="Arial,sans-serif">
                            <g transform="translate(195 18)"><rect width="130" height="57" rx="10" fill="#173b69" stroke="#4279bd"/><text x="16" y="25" fill="#eef6ff" fontSize="12" fontWeight="700">INTERNET</text><text x="16" y="43" fill="#9fc5f5" fontSize="10">WAN gateway</text></g>
                            <g transform="translate(195 104)"><rect width="130" height="57" rx="10" fill="#1d4b82" stroke="#5d9dea"/><text x="16" y="25" fill="#fff" fontSize="12" fontWeight="700">CORE ROUTER</text><text x="16" y="43" fill="#b8d6fa" fontSize="10">10.10.0.1</text></g>
                            <g transform="translate(53 223)"><rect width="134" height="57" rx="10" fill="#173b69" stroke="#4279bd"/><text x="16" y="25" fill="#eef6ff" fontSize="12" fontWeight="700">ACCESS SWITCH</text><text x="16" y="43" fill="#9fc5f5" fontSize="10">48 ports active</text></g>
                            <g transform="translate(333 223)"><rect width="134" height="57" rx="10" fill="#173b69" stroke="#4279bd"/><text x="16" y="25" fill="#eef6ff" fontSize="12" fontWeight="700">APP SERVER</text><text x="16" y="43" fill="#9fc5f5" fontSize="10">Healthy</text></g>
                        </g>
                    </svg>
                </div></div>
                <div className="na-auth-aside-copy"><h2>Your network, in one clear view.</h2><p>Keep your infrastructure organized, connected, and ready for what comes next.</p></div>
                <div className="na-auth-assurance"><ShieldCheck size={17}/> A secure workspace for your network</div>
            </div>
        </div>
    );
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<{ name?: string; title?: string; description?: string }>) {
    return (
        <div className="na-auth">
            <style>{authCss}</style>
            <main className="na-auth-main">
                <Brand />
                <section className="na-auth-content">
                    <header className="na-auth-heading"><h1>{title}</h1><p>{description}</p></header>
                    <div className="na-auth-form">{children}</div>
                </section>
            </main>
            <NetworkIllustration />
        </div>
    );
}
