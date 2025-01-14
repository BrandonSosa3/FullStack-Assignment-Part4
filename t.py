def isSubsequence(s, t):
    count =0
    for i in range(len(t)):
        if t[i] == s[count]:
            count+=1
            if count == len(s):
                return True
    return False

print(isSubsequence("abc","ahbgdc"))