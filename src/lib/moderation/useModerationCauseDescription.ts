import {ModerationCause} from '@atproto/api'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useGlobalLabelStrings} from './useGlobalLabelStrings'
import {useLabelDefinitions} from '#/state/queries/preferences'
import {getDefinition, getLabelStrings} from './useLabelInfo'

import {Warning_Stroke2_Corner0_Rounded as Warning} from '#/components/icons/Warning'
import {CircleInfo_Stroke2_Corner0_Rounded as CircleInfo} from '#/components/icons/CircleInfo'
import {EyeSlash_Stroke2_Corner0_Rounded as EyeSlash} from '#/components/icons/EyeSlash'
import {CircleBanSign_Stroke2_Corner0_Rounded as CircleBanSign} from '#/components/icons/CircleBanSign'

export interface ModerationCauseDescription {
  icon: any
  name: string
  description: string
  source?: string
}

export function useModerationCauseDescription(
  cause: ModerationCause | undefined,
): ModerationCauseDescription {
  const {_, i18n} = useLingui()
  const globalLabelStrings = useGlobalLabelStrings()
  const {labelDefs, labelers} = useLabelDefinitions()
  if (!cause) {
    return {
      icon: Warning,
      name: _(msg`Content Warning`),
      description: _(
        msg`Moderator has chosen to set a general warning on the content.`,
      ),
    }
  }
  if (cause.type === 'blocking') {
    if (cause.source.type === 'list') {
      return {
        icon: CircleBanSign,
        name: _(msg`User Blocked by "${cause.source.list.name}"`),
        description: _(
          msg`You have blocked this user. You cannot view their content.`,
        ),
      }
    } else {
      return {
        icon: CircleBanSign,
        name: _(msg`User Blocked`),
        description: _(
          msg`You have blocked this user. You cannot view their content.`,
        ),
      }
    }
  }
  if (cause.type === 'blocked-by') {
    return {
      icon: CircleBanSign,
      name: _(msg`User Blocking You`),
      description: _(
        msg`This user has blocked you. You cannot view their content.`,
      ),
    }
  }
  if (cause.type === 'block-other') {
    return {
      icon: CircleBanSign,
      name: _(msg`Content Not Available`),
      description: _(
        msg`This content is not available because one of the users involved has blocked the other.`,
      ),
    }
  }
  if (cause.type === 'muted') {
    if (cause.source.type === 'list') {
      return {
        icon: EyeSlash,
        name: _(msg`Muted by "${cause.source.list.name}"`),
        description: _(msg`You have muted this user`),
      }
    } else {
      return {
        icon: EyeSlash,
        name: _(msg`Muted User`),
        description: _(msg`You have muted this user`),
      }
    }
  }
  // TODO
  // if (cause.type === 'muted-word') {
  //   return {
  //     icon: EyeSlash,
  //     name: _(msg`Post hidden by muted word`),
  //     description: _(
  //       msg`You've chosen to hide a word or tag within this post.`,
  //     ),
  //   }
  // }
  // @ts-ignore Temporary extension to the moderation system -prf
  if (cause.type === 'hidden') {
    return {
      icon: EyeSlash,
      name: _(msg`Post Hidden by You`),
      description: _(msg`You have hidden this post`),
    }
  }
  if (cause.type === 'label') {
    const def = getDefinition(labelDefs, cause.label)
    const strings = getLabelStrings(i18n.locale, globalLabelStrings, def)
    const labeler = labelers.find(l => l.creator.did === cause.label.src)
    return {
      icon:
        def.identifier === '!no-unauthenticated'
          ? EyeSlash
          : def.severity === 'alert'
          ? Warning
          : CircleInfo,
      name: strings.name,
      description: strings.description,
      source: labeler?.creator.displayName || labeler?.creator.handle,
    }
  }
  // should never happen
  return {
    icon: CircleInfo,
    name: '',
    description: ``,
  }
}