import React, { FC, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { gql } from '@urql/core';

import { ButtonAppearance, MessageType } from '../constants';
import { useYAuth } from '../contexts/YAuthContext';
import { Input, Label, FieldWrapper, Required, Button, Error } from '../styles';
import { isValidEmail } from '../utils/validations';
import { YAuthSocialLogin } from './YAuthSocialLogin';
import { formatErrorMessage } from '../utils/format';
import { Message } from './Message';

export const YAuthSignup: FC = () => {
  const [error, setError] = useState(``);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(``);
  const { graphQlRef } = useYAuth();

  const onSubmit = async (values: Record<string, string>) => {
    console.log({ values });
    setLoading(true);
    const res = await graphQlRef
      .mutation(
        gql`
          mutation signup($params: SignUpInput!) {
            signup(params: $params) {
              message
            }
          }
        `,
        {
          params: values,
        }
      )
      .toPromise();
    setLoading(false);
    if (res?.error?.message) {
      setError(formatErrorMessage(res.error.message));
    }

    if (res.data) {
      setError(``);
      setSuccessMessage(res.data.signup.message);
    }

    console.log({ res });
  };

  const onErrorClose = () => {
    setError(``);
  };

  if (successMessage) {
    return <Message type={MessageType.Success} text={successMessage} />;
  }

  return (
    <>
      {error && (
        <Message type={MessageType.Error} text={error} onClose={onErrorClose} />
      )}
      <YAuthSocialLogin />
      <Form
        onSubmit={onSubmit}
        validate={(values) => {
          const errors: Record<string, string> = {};
          if (!values.email) {
            errors.email = 'Email is required';
          }

          if (
            values.email &&
            values.email.trim() &&
            !isValidEmail(values.email)
          ) {
            errors.email = `Please enter valid email`;
          }

          if (!values.password) {
            errors.password = 'Password is required';
          }

          if (!values.confirmPassword) {
            errors.password = 'Confirm password is required';
          }

          if (
            values.password &&
            values.confirmPassword &&
            values.confirmPassword !== values.password
          ) {
            errors.confirmPassword = `Password and confirm passwords don't match`;
            errors.password = `Password and confirm passwords don't match`;
          }
          return errors;
        }}
      >
        {({ handleSubmit, pristine }) => (
          <form onSubmit={handleSubmit} name="yauth-signup-form">
            <FieldWrapper>
              <Field name="email">
                {({ input, meta }) => (
                  <div>
                    <Label>
                      <Required>*</Required>Email
                    </Label>
                    <Input
                      {...input}
                      type="email"
                      placeholder="eg. foo@bar.com"
                      hasError={Boolean(meta.error && meta.touched)}
                    />
                    {meta.error && meta.touched && <Error>{meta.error}</Error>}
                  </div>
                )}
              </Field>
            </FieldWrapper>
            <FieldWrapper>
              <Field name="password">
                {({ input, meta }) => (
                  <div>
                    <Label>
                      <Required>*</Required>
                      Password
                    </Label>
                    <Input
                      {...input}
                      type="password"
                      placeholder="*********"
                      hasError={Boolean(meta.error && meta.touched)}
                    />
                    {meta.error && meta.touched && <Error>{meta.error}</Error>}
                  </div>
                )}
              </Field>
            </FieldWrapper>
            <FieldWrapper>
              <Field name="confirmPassword">
                {({ input, meta }) => (
                  <div>
                    <Label>
                      <Required>*</Required>
                      Confirm Password
                    </Label>
                    <Input
                      {...input}
                      type="password"
                      placeholder="*********"
                      hasError={Boolean(meta.error && meta.touched)}
                    />
                    {meta.error && meta.touched && <Error>{meta.error}</Error>}
                  </div>
                )}
              </Field>
            </FieldWrapper>
            <br />
            <Button
              type="submit"
              disabled={pristine || loading}
              appearance={ButtonAppearance.Primary}
            >
              {loading ? `Processing ...` : `Sign Up`}
            </Button>
          </form>
        )}
      </Form>
    </>
  );
};