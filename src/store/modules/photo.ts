import type { ActionContext, Module, MutationTree } from 'vuex'
import {
  uploadFile,
  createPhotoRecord,
  deletePhotoRecord,
  createPhotoTags,
  getPhotoTagsByPhotoId,
  getPhotoAlbum,
  getPhotoPage
} from '@/api/photo/index'
import type {
  CreatePhotoRecordPayload,
  PhotoPageGroupResult,
  PhotoPageParams,
  PhotoState,
  RootState
} from '@/store/types'

const state = (): PhotoState => ({
  id: 0
})

const mutations: MutationTree<PhotoState> = {
  SET_ID(state, id: number) {
    state.id = id
  }
}

type PhotoActionContext = ActionContext<PhotoState, RootState>

const actions = {
  UploadFile(_ctx: PhotoActionContext, fileInfo: Record<string, unknown>): Promise<void> {
    return uploadFile(fileInfo).then(() => undefined)
  },

  CreatePhotoRecord(_ctx: PhotoActionContext, params: CreatePhotoRecordPayload): Promise<void> {
    return createPhotoRecord(params).then(() => undefined)
  },

  DeletePhotoRecord(_ctx: PhotoActionContext, id: number | string): Promise<void> {
    return deletePhotoRecord(String(id)).then(() => undefined)
  },

  CreatePhotoTags(_ctx: PhotoActionContext, data: { photoId: number | string; text: string }): Promise<void> {
    return createPhotoTags({
      photoId: String(data.photoId),
      name: data.text
    }).then(() => undefined)
  },

  GetPhotoTagsByPhotoId(_ctx: PhotoActionContext, photoId: number | string): Promise<unknown> {
    return getPhotoTagsByPhotoId(photoId).then((res) => res.data)
  },

  GetPhotoAlbum(_ctx: PhotoActionContext): Promise<unknown> {
    return getPhotoAlbum().then((res) => res.data)
  },

  GetPhotoPage(_ctx: PhotoActionContext, params: PhotoPageParams): Promise<PhotoPageGroupResult> {
    return getPhotoPage(params).then((res) => res.data as PhotoPageGroupResult)
  }
}

const photo: Module<PhotoState, RootState> = {
  state,
  mutations,
  actions
}

export default photo
