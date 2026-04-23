import { storeConfig } from "../lib/store"

export function Footer() {
  return (
    <footer className="site-shell site-footer">
      <div>
        <p className="eyebrow">Visit</p>
        <p>{storeConfig.address}</p>
      </div>
      <div>
        <p className="eyebrow">Hours</p>
        <p>{storeConfig.hours}</p>
      </div>
      <div>
        <p className="eyebrow">Compliance</p>
        <p>21+ only. Valid ID required.</p>
      </div>
      <div>
        <p className="eyebrow">Contact</p>
        <p>{storeConfig.phone}</p>
      </div>
    </footer>
  )
}
