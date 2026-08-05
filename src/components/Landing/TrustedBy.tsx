import itel from "../../assets/trusted1.svg";
import sako from "../../assets/sako.webp";
import qasa from "../../assets/trusted2.svg";
import afriipower from "../../assets/afriipower.jpg";
import smarteen from "../../assets/smarten-logo.svg";
import smsenergy from "../../assets/sms.png";
import firman from "../../assets/FIRMAN_LOGO.webp";
import LVTOPSUN from "../../assets/LVTOPSUN.webp";
import SOUER from "../../assets/Souer_Logo-1.png"
import Africell from "../../assets/africell.png"
import SUNFIT from "../../assets/sunfi.png";
import BESTCOM from "../../assets/bestcom.jpg";
import TURBOSUN from "../../assets/TURBOSUN.webp";
import JASOLAR from "../../assets/jasolar.png";
import BONA from "../../assets/bona-logo.svg";
import Duravolt from "../../assets/DURAVOLT.webp";

import "./TrustedBy.css";

const LOGOS = [
  { name: "itel", src: itel },
  { name: "Sako", src: sako },
  { name: "Qasa", src: qasa },
  { name: "AfriiPower", src: afriipower },
  { name: "Smarteen", src: smarteen },
  { name: "SMS Energy", src: smsenergy },
  { name: "Firman", src: firman },
  { name: "LVTOPSUN", src: LVTOPSUN },
  { name: "SOUER", src: SOUER },
  { name: "Africell", src: Africell },
  { name: "SUNFIT", src: SUNFIT },
  { name: "BESTCOM", src: BESTCOM },
  { name: "TURBOSUN", src: TURBOSUN },
  { name: "JASOLAR", src: JASOLAR },
  { name: "BONA", src: BONA },
  { name: "Duravolt", src: Duravolt },  
];

export default function TrustedBy() {
  return (
    <section className="trusted-by">
      <div className="container">
        <p className="trusted-by__label">Trusted Products From Industry-Leading Brands</p>
      </div>

      <div className="trusted-by__marquee">
        <div className="trusted-by__track">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <div className="trusted-by__item" key={`${logo.name}-${i}`}>
              <img src={logo.src} alt={logo.name} className="trusted-by__logo" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}