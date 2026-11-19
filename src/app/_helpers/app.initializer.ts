import { AccountService } from '@app/_services';

export function appInitializer(accountService: AccountService) {
    return () => new Promise(resolve => {
        const token = localStorage.getItem('token');
        // attempt to refresh token on app start up to auto authenticate
        if (token) {
            accountService.setAccountValue = {
                token,
                user: JSON.parse(localStorage.getItem('user'))
            };
            /*accountService.refreshToken(token)
                .subscribe()
                .add(resolve);*/
        }
        resolve();
    });
}
