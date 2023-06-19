import request from '@/utils/request';
export async function getreleaseHistory(){
    return request("/api/releasehistory")
}
