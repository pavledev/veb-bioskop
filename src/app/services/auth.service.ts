import { inject, Injectable } from '@angular/core';
import {
    Auth,
    AuthErrorCodes,
    authState,
    createUserWithEmailAndPassword,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    signOut,
    updateEmail,
    updatePassword,
    updateProfile,
    User,
    EmailAuthProvider
} from '@angular/fire/auth';
import { UserModel } from '../models/user.model';
import {
    collection,
    doc,
    Firestore,
    FirestoreError,
    getDoc, getDocs,
    query,
    setDoc,
    updateDoc,
    where
} from '@angular/fire/firestore';
import { UtilityService } from './utility.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService
{
    private firebaseAuth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);
    private userService: UserService = inject(UserService);
    private utilityService: UtilityService = inject(UtilityService);

    private userSubject = new BehaviorSubject<User | null>(null);

    constructor()
    {
        authState(this.firebaseAuth).subscribe(async (user) =>
        {
            this.userSubject.next(user);

            if (user)
            {
                await this.userService.getUserDocument(user.uid);
            }
            else
            {
                this.userService.clearUserDocument();
            }
        });
    }

    get currentUser(): User | null
    {
        return this.firebaseAuth.currentUser;
    }

    get user$(): Observable<User | null>
    {
        return this.userSubject.asObservable();
    }

    async register(user: UserModel)
    {
        const isAvailable = await this.userService.checkUsernameAvailability(user.username, '');

        if (!isAvailable)
        {
            return ['Već postoji korisnik sa ovim korisničkim imenom!'];
        }

        let errorMessage = 'Došlo je do greške prilikom registracije!';
        const [authError, firebaseUser] = await this.utilityService.catchError(
            createUserWithEmailAndPassword(this.firebaseAuth,
                user.email,
                user.password)
        );

        if (authError)
        {
            const error = authError as FirestoreError;
            const code = error.code as string;

            if (code === AuthErrorCodes.EMAIL_EXISTS)
            {
                errorMessage = 'Već postoji korisnik sa ovom email adresom!';
            }

            return [errorMessage];
        }

        const [profileError] = await this.utilityService.catchError(
            updateProfile(firebaseUser.user, { displayName: user.username })
        );

        if (profileError)
        {
            return [errorMessage];
        }

        const [dbError] = await this.utilityService.catchError(
            setDoc(doc(this.firestore, 'users', firebaseUser.user.uid), user)
        );

        if (dbError)
        {
            return [errorMessage];
        }

        await signOut(this.firebaseAuth);

        return ['', firebaseUser];
    }

    async login(email: string, password: string)
    {
        const [authError, firebaseUser] = await this.utilityService.catchError(
            signInWithEmailAndPassword(this.firebaseAuth, email, password)
        );

        if (authError)
        {
            const error = authError as FirestoreError;
            const code = error.code as string;

            if (code === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS)
            {
                return ['Korisnik nije pronadjen ili je neispravna lozinka!'];
            }

            return ['Došlo je do greške prilikom prijavljivanja!'];
        }

        return ['', firebaseUser];
    }

    async logout()
    {
        await signOut(this.firebaseAuth);

        this.userSubject.next(null);
        this.userService.clearUserDocument();
    }

    async updateFirebaseUser(user: Partial<UserModel>)
    {
        const currentUser = this.firebaseAuth.currentUser;

        if (!currentUser)
        {
            return 'Morate biti prijavljeni da biste ažurirali profil.';
        }

        let errorMessage = 'Došlo je do greške prilikom ažuriranja profila!';

        if (user.email)
        {
            const [emailError] = await this.utilityService.catchError(updateEmail(currentUser, user.email));

            if (emailError)
            {
                const error = emailError as FirestoreError;
                const code = error.code as string;

                if (code === AuthErrorCodes.EMAIL_EXISTS)
                {
                    errorMessage = 'Već postoji korisnik sa ovom email adresom!';
                }

                return errorMessage;
            }
        }

        if (user.password)
        {
            const [passwordError] = await this.utilityService.catchError(updatePassword(currentUser, user.password));

            if (passwordError)
            {
                return errorMessage;
            }
        }

        if (user.username)
        {
            const [profileError] = await this.utilityService.catchError(updateProfile(currentUser, { displayName: user.username }));

            if (profileError)
            {
                return errorMessage;
            }
        }

        return null;
    }

    async reauthenticateUser(password: string)
    {
        const currentUser = this.firebaseAuth.currentUser;

        if (!currentUser)
        {
            return 'Morate biti prijavljeni da biste ažurirali profil.';
        }

        const credential = EmailAuthProvider.credential(currentUser.email!, password);
        const [reauthError] = await this.utilityService.catchError(reauthenticateWithCredential(currentUser, credential));

        return reauthError ? 'Pogrešna lozinka. Pokušajte ponovo.' : null;
    }
}
