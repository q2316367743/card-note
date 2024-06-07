import {ref, Ref, shallowRef} from "vue";
import {buildDefaultRole, Role} from "@/entity/Role";
import {Avatar, Button, Form, FormItem, Input, Modal, Textarea, Upload, UploadRequest} from "@arco-design/web-vue";
import {getAttachmentAsync, postAttachment, removeOneByAsync} from "@/utils/utools/DbStorageUtil";
import {RequestOption} from "@arco-design/web-vue/es/upload/interfaces";
import {useRoleStore} from "@/store/RoleStore";
import MessageUtil from "@/utils/MessageUtil";

function buildForm(data: Ref<Role>, avatar: Ref<string>, customerUpload: (option: RequestOption) => UploadRequest) {
    return <Form model={data.value} layout={'horizontal'}>
        <FormItem label="头像">
            <Avatar imageUrl={avatar.value}/>
            <Upload accept={'image/png, image/jpg, image/jpeg, image/gif'} customRequest={customerUpload}
                    showFileList={false}>{{
                'upload-button': () => <Button type={'primary'} style={{marginLeft: '16px'}}>更换</Button>
            }}</Upload>
        </FormItem>
        <FormItem label="昵称">
            <Input v-model={data.value.name} allowClear={true} showWordLimit={true} maxLength={32}/>
        </FormItem>
        <FormItem label={'描述'}>
            <Textarea v-model={data.value.description} allowClear={true} showWordLimit={true} maxLength={255}
                      autoSize={{minRows: 3, maxRows: 9}}/>
        </FormItem>
    </Form>;
}

export function showAddRoleModal() {
    const data = ref<Role>(buildDefaultRole());
    const avatar = ref(data.value.avatar);
    const fileWrap = shallowRef<File>()
    if (data.value.avatar.startsWith("/avatar/")) {
        getAttachmentAsync(data.value.avatar)
            .then(url => avatar.value = url);
    } else {
        avatar.value = data.value.avatar;
    }

    function customerUpload(option: RequestOption): UploadRequest {

        const {file} = option.fileItem;

        if (file) {
            if (avatar.value.startsWith("blob")) {
                window.URL.revokeObjectURL(avatar.value);
            }
            fileWrap.value = file;
            avatar.value = window.URL.createObjectURL(file);
        }


        return {
            abort: () => {
            }
        }
    }

    Modal.open({
        title: '新增角色',
        draggable: true,
        content: () => buildForm(data, avatar, customerUpload),
        okText: '新增',
        async onBeforeOk() {
            try {
                if (avatar.value.startsWith("blob")) {
                    window.URL.revokeObjectURL(avatar.value);
                }
                const id = new Date().getTime();
                let avatarWrap = data.value.avatar;
                const docId = `/avatar/${id}`;
                if (fileWrap.value) {
                    // 删除旧的附件
                    await removeOneByAsync(docId, true);
                    avatarWrap = await postAttachment(docId, fileWrap.value)
                }
                await useRoleStore().add({
                    id: id,
                    avatar: avatarWrap,
                    name: data.value.name,
                    description: data.value.description
                });
                return true;
            } catch (e) {
                MessageUtil.error("新增角色失败");
                return false;
            }
        },
        onOk() {
            MessageUtil.success("新增成功");
        },
    })
}
