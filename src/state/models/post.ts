import {makeAutoObservable} from 'mobx'
import * as Post from '../../third-party/api/src/client/types/app/bsky/feed/post'
import {AtUri} from '../../third-party/uri'
import {RootStoreModel} from './root-store'
import {cleanError} from '../../view/lib/strings'

export type PostEntities = Post.Record['entities']
export type PostReply = Post.Record['reply']
type RemoveIndex<T> = {
  [P in keyof T as string extends P
    ? never
    : number extends P
    ? never
    : P]: T[P]
}
export class PostModel implements RemoveIndex<Post.Record> {
  // state
  isLoading = false
  hasLoaded = false
  error = ''
  uri: string = ''

  // data
  text: string = ''
  entities?: PostEntities
  reply?: PostReply
  createdAt: string = ''

  constructor(public rootStore: RootStoreModel, uri: string) {
    makeAutoObservable(
      this,
      {
        rootStore: false,
        uri: false,
      },
      {autoBind: true},
    )
    this.uri = uri
  }

  get hasContent() {
    return this.createdAt !== ''
  }

  get hasError() {
    return this.error !== ''
  }

  get isEmpty() {
    return this.hasLoaded && !this.hasContent
  }

  // public api
  // =

  async setup() {
    await this._load()
  }

  // state transitions
  // =

  private _xLoading() {
    this.isLoading = true
    this.error = ''
  }

  private _xIdle(err: string = '') {
    this.isLoading = false
    this.hasLoaded = true
    this.error = cleanError(err)
  }

  // loader functions
  // =

  private async _load() {
    this._xLoading()
    try {
      const urip = new AtUri(this.uri)
      const res = await this.rootStore.api.app.bsky.feed.post.get({
        user: urip.host,
        rkey: urip.rkey,
      })
      // TODO
      // if (!res.valid) {
      //   throw new Error(res.error)
      // }
      this._replaceAll(res.value)
      this._xIdle()
    } catch (e: any) {
      this._xIdle(e.toString())
    }
  }

  private _replaceAll(res: Post.Record) {
    this.text = res.text
    this.entities = res.entities
    this.reply = res.reply
    this.createdAt = res.createdAt
  }
}
