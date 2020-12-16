import shortid from 'shortid'

interface Input {
  id?: string
  domains: string[]
  cert: string
  url: string
  metadata: string
}

export default class SAML {
  id: string
  domains: string[]
  cert: string
  url: string
  metadata: string
  createdAt = new Date()
  updatedAt = new Date()

  constructor(input: Input) {
    const {id, domains, cert, url, metadata} = input
    this.id = id || shortid.generate()
    this.domains = domains || []
    this.cert = cert
    this.url = url
    this.metadata = metadata
  }
}
